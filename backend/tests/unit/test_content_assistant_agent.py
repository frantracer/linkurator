import uuid
from datetime import date, datetime, timezone
from unittest.mock import AsyncMock, Mock
from uuid import UUID

import pytest
from pydantic_ai import capture_run_messages
from pydantic_ai.messages import ModelRequest, ToolReturnPart
from pydantic_ai.models.test import TestModel
from pydantic_ai.usage import RunUsage

from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.chats.chat import ChatScope
from linkurator_core.domain.common.mock_factory import (
    mock_chat,
    mock_chat_message,
    mock_item,
    mock_sub,
    mock_topic,
)
from linkurator_core.domain.items.item_repository import ItemFilterCriteria, ItemRepository, SimilarItem
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user_repository import UserRepository
from linkurator_core.infrastructure.ai_agents.content_assistant_agent import (
    ContentAssistantAgent,
    ContentAssistantDependencies,
    ItemForAI,
    build_latest_items_criteria,
    build_search_filter,
    short_id,
)


def _make_deps(
    user_uuid: UUID | None = None,
    topic_repository: TopicRepository | None = None,
    scope: ChatScope | None = None,
    candidate_item_ids: set[UUID] | None = None,
) -> ContentAssistantDependencies:
    return ContentAssistantDependencies(
        user_uuid=user_uuid,
        user_repository=Mock(),
        subscription_repository=Mock(),
        item_repository=Mock(),
        topic_repository=topic_repository or AsyncMock(spec=TopicRepository),
        embedding_service=None,
        previous_chat=None,
        scope=scope,
        candidate_item_ids=candidate_item_ids or set(),
    )


def _embedding_service() -> AsyncMock:
    service = AsyncMock(spec=EmbeddingService)
    service.embed_query.return_value = [1.0, 0.0]
    service.related_similarity_threshold = Mock(return_value=0.4)
    service.unrelated_similarity_threshold = Mock(return_value=0.3)
    return service


def _make_agent(
    model: TestModel,
    item_repository: AsyncMock,
    embedding_service: EmbeddingService | None,
) -> ContentAssistantAgent:
    sub = mock_sub()
    subscription_repository = AsyncMock(spec=SubscriptionRepository)
    subscription_repository.get_list.return_value = [sub]
    topic_repository = AsyncMock(spec=TopicRepository)
    topic_repository.find_topics.return_value = []
    topic_repository.get_by_user_id.return_value = []
    user_repository = AsyncMock(spec=UserRepository)
    user_repository.get.return_value = None
    return ContentAssistantAgent(
        model=model,
        base_url="https://linkurator.com",
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        item_repository=item_repository,
        topic_repository=topic_repository,
        embedding_service=embedding_service,
        providers=["youtube", "spotify"],
    )


def test_is_scoped_only_when_scope_has_entity_restriction() -> None:
    assert _make_deps().is_scoped() is False
    assert _make_deps(scope=ChatScope()).is_scoped() is False
    assert _make_deps(scope=ChatScope(topic_ids=[uuid.uuid4()])).is_scoped() is True


@pytest.mark.asyncio()
async def test_build_search_filter_unscoped_uses_llm_restrictions() -> None:
    sub_id = uuid.uuid4()
    topic = mock_topic(subscription_uuids=[uuid.uuid4()])
    topic_repository = AsyncMock(spec=TopicRepository)
    topic_repository.find_topics.return_value = [topic]
    deps = _make_deps(topic_repository=topic_repository)
    deps.register_subscription_id(sub_id)
    deps.register_topic(topic)

    filters = await build_search_filter(
        deps=deps,
        topic_ids=[short_id(topic.uuid)],
        subscription_ids=[short_id(sub_id)],
        min_duration_minutes=10,
        max_duration_minutes=60,
        published_after=date(2025, 1, 1),
        published_before=date(2025, 2, 1),
        providers=["youtube", "youtube"],
    )

    topic_repository.find_topics.assert_awaited_once_with([topic.uuid])
    assert set(filters.subscription_ids or []) == {sub_id, topic.subscriptions_ids[0]}
    assert filters.item_ids is None
    assert filters.min_duration == 600
    assert filters.max_duration == 3600
    assert filters.published_after == datetime(2025, 1, 1, tzinfo=timezone.utc)
    assert filters.published_before == datetime(2025, 2, 1, tzinfo=timezone.utc)
    assert filters.providers == ["youtube"]


@pytest.mark.asyncio()
async def test_build_search_filter_without_restrictions_searches_everything() -> None:
    topic_repository = AsyncMock(spec=TopicRepository)
    deps = _make_deps(topic_repository=topic_repository)

    filters = await build_search_filter(
        deps=deps, topic_ids=None, subscription_ids=None, min_duration_minutes=None, max_duration_minutes=None,
        published_after=None, published_before=None, providers=None,
    )

    topic_repository.find_topics.assert_not_awaited()
    assert filters.subscription_ids is None
    assert filters.item_ids is None
    assert filters.min_duration is None
    assert filters.max_duration is None
    assert filters.providers == []


@pytest.mark.asyncio()
async def test_build_search_filter_scoped_ignores_llm_ids_and_uses_candidates() -> None:
    candidate_ids = {uuid.uuid4(), uuid.uuid4()}
    topic_repository = AsyncMock(spec=TopicRepository)
    deps = _make_deps(
        scope=ChatScope(topic_ids=[uuid.uuid4()]),
        candidate_item_ids=candidate_ids,
        topic_repository=topic_repository,
    )

    filters = await build_search_filter(
        deps=deps, topic_ids=[str(uuid.uuid4())], subscription_ids=[str(uuid.uuid4())],
        min_duration_minutes=None, max_duration_minutes=None, published_after=None, published_before=None,
        providers=None,
    )

    topic_repository.find_topics.assert_not_awaited()
    assert filters.item_ids == candidate_ids
    assert filters.subscription_ids is None


@pytest.mark.asyncio()
async def test_build_search_filter_scoped_with_no_candidates_matches_nothing() -> None:
    deps = _make_deps(scope=ChatScope(topic_ids=[uuid.uuid4()]))

    filters = await build_search_filter(
        deps=deps, topic_ids=None, subscription_ids=None, min_duration_minutes=None, max_duration_minutes=None,
        published_after=None, published_before=None, providers=None,
    )

    assert filters.item_ids == set()


@pytest.mark.asyncio()
async def test_build_search_filter_entityless_scope_keeps_the_stricter_durations() -> None:
    deps = _make_deps(scope=ChatScope(min_duration=300, max_duration=1200))

    stricter_llm = await build_search_filter(
        deps=deps, topic_ids=None, subscription_ids=None, min_duration_minutes=10, max_duration_minutes=15,
        published_after=None, published_before=None, providers=None,
    )
    looser_llm = await build_search_filter(
        deps=deps, topic_ids=None, subscription_ids=None, min_duration_minutes=1, max_duration_minutes=60,
        published_after=None, published_before=None, providers=None,
    )

    assert (stricter_llm.min_duration, stricter_llm.max_duration) == (600, 900)
    assert (looser_llm.min_duration, looser_llm.max_duration) == (300, 1200)
    assert stricter_llm.item_ids is None


@pytest.mark.asyncio()
async def test_build_latest_items_criteria_unscoped_uses_llm_provided_ids() -> None:
    sub_id = uuid.uuid4()
    topic = mock_topic(subscription_uuids=[uuid.uuid4()])
    topic_repository = AsyncMock(spec=TopicRepository)
    topic_repository.find_topics.return_value = [topic]
    deps = _make_deps(user_uuid=uuid.uuid4(), topic_repository=topic_repository)
    deps.register_subscription_id(sub_id)
    deps.register_topic(topic)

    criteria = await build_latest_items_criteria(deps, [short_id(topic.uuid)], [short_id(sub_id)])

    assert criteria.item_ids is None
    assert set(criteria.subscription_ids or []) == {sub_id, topic.subscriptions_ids[0]}
    assert criteria.interactions_from_user == deps.user_uuid
    assert criteria.interactions.without_interactions is True


@pytest.mark.asyncio()
async def test_build_latest_items_criteria_scoped_ignores_llm_provided_ids() -> None:
    candidate_ids = {uuid.uuid4()}
    deps = _make_deps(scope=ChatScope(subscription_ids=[uuid.uuid4()]), candidate_item_ids=candidate_ids)

    criteria = await build_latest_items_criteria(deps, [str(uuid.uuid4())], [str(uuid.uuid4())])

    assert criteria.item_ids == candidate_ids
    assert criteria.subscription_ids is None


@pytest.mark.asyncio()
async def test_build_latest_items_criteria_entityless_scope_applies_filters() -> None:
    user_id = uuid.uuid4()
    deps = _make_deps(
        user_uuid=user_id,
        scope=ChatScope(text_search="rust", min_duration=300, max_duration=1200, include_hidden_items=False),
    )
    sub_id = uuid.uuid4()

    criteria = await build_latest_items_criteria(deps, None, [str(sub_id)])

    assert criteria.subscription_ids == [sub_id]
    assert criteria.text == "rust"
    assert criteria.min_duration == 300
    assert criteria.max_duration == 1200
    assert criteria.interactions_from_user == user_id
    assert criteria.interactions.hidden is False


def test_item_for_ai_truncates_long_descriptions() -> None:
    item = mock_item(description="a" * 20)

    truncated = ItemForAI.from_item(item=item, sub_name="sub", description_length=5, relevance=0.123)
    full = ItemForAI.from_item(item=item, sub_name="sub")

    assert truncated.description == "aaaaa..."
    assert truncated.relevance == 0.12
    assert full.description == "a" * 20
    assert full.relevance is None


@pytest.mark.asyncio()
async def test_scoped_query_constrains_every_tool_call_to_candidate_items() -> None:
    item = mock_item()
    item_repository = AsyncMock(spec=ItemRepository)
    item_repository.find_items.return_value = [item]
    item_repository.find_similar_items.return_value = [SimilarItem(item=item, similarity=0.8)]
    agent = _make_agent(TestModel(), item_repository, _embedding_service())
    chat = mock_chat(messages=[mock_chat_message(scope=ChatScope(topic_ids=[uuid.uuid4()]))])

    await agent.query(query="What is new about cooking?", user_id=None, previous_chat=chat, usage=RunUsage())

    # The first call resolves the candidate items; every tool call after it must be limited to them.
    resolution_call, *latest_items_calls = item_repository.find_items.call_args_list
    assert resolution_call.kwargs["criteria"].item_ids is None
    assert len(latest_items_calls) >= 1
    for call in latest_items_calls:
        criteria: ItemFilterCriteria = call.kwargs["criteria"]
        assert criteria.item_ids == {item.uuid}

    item_repository.find_similar_items.assert_awaited()
    for call in item_repository.find_similar_items.call_args_list:
        assert call.kwargs["filters"].item_ids == {item.uuid}
        assert call.kwargs["filters"].subscription_ids is None


@pytest.mark.asyncio()
async def test_unscoped_query_searches_by_embeddings() -> None:
    item = mock_item()
    item_repository = AsyncMock(spec=ItemRepository)
    item_repository.find_similar_items.return_value = [SimilarItem(item=item, similarity=0.8)]
    embedding_service = _embedding_service()
    agent = _make_agent(TestModel(call_tools=["search_content"]), item_repository, embedding_service)

    result = await agent.query(query="Videos about cooking", user_id=None, previous_chat=None, usage=RunUsage())

    embedding_service.embed_query.assert_awaited()
    item_repository.find_similar_items.assert_awaited_once()
    filters = item_repository.find_similar_items.call_args.kwargs["filters"]
    assert filters.item_ids is None
    assert result.response != ""


@pytest.mark.asyncio()
async def test_search_discards_unrelated_items() -> None:
    related_item = mock_item()
    unrelated_item = mock_item()
    item_repository = AsyncMock(spec=ItemRepository)
    item_repository.find_similar_items.return_value = [
        SimilarItem(item=related_item, similarity=0.5),
        SimilarItem(item=unrelated_item, similarity=0.2),
    ]
    agent = _make_agent(TestModel(call_tools=["search_content"]), item_repository, _embedding_service())

    with capture_run_messages() as messages:
        await agent.query(query="Videos about cooking", user_id=None, previous_chat=None, usage=RunUsage())

    search_returns = [
        part.model_response_str()
        for message in messages if isinstance(message, ModelRequest)
        for part in message.parts if isinstance(part, ToolReturnPart) and part.tool_name == "search_content"
    ]
    assert len(search_returns) == 1
    assert short_id(related_item.uuid) in search_returns[0]
    assert short_id(unrelated_item.uuid) not in search_returns[0]


@pytest.mark.asyncio()
async def test_search_tool_is_not_offered_without_embedding_service() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    item_repository.find_items.return_value = []
    agent = _make_agent(TestModel(), item_repository, None)

    await agent.query(query="Videos about cooking", user_id=None, previous_chat=None, usage=RunUsage())

    item_repository.find_similar_items.assert_not_called()
    item_repository.find_items.assert_awaited()


@pytest.mark.asyncio()
async def test_items_details_are_only_returned_for_items_in_the_context() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    agent = _make_agent(TestModel(call_tools=["get_items_details"]), item_repository, None)

    await agent.query(query="What is this video about?", user_id=None, previous_chat=None, usage=RunUsage())

    item_repository.find_items.assert_not_called()
