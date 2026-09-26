import uuid
from unittest.mock import AsyncMock

import pytest

from linkurator_core.domain.chats.chat import ChatScope
from linkurator_core.domain.common.mock_factory import mock_interaction, mock_item, mock_topic
from linkurator_core.domain.items.interaction import InteractionType
from linkurator_core.domain.items.item_repository import InteractionFilterCriteria, ItemFilterCriteria, ItemRepository
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.infrastructure.ai_agents.chat_scope_resolver import (
    MAX_SCOPE_CANDIDATE_ITEMS,
    resolve_scope_candidate_item_ids,
)


@pytest.mark.asyncio()
async def test_resolve_scope_with_subscription_ids_only() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    topic_repository = AsyncMock(spec=TopicRepository)
    user_id = uuid.uuid4()
    subscription_id = uuid.uuid4()
    item = mock_item(sub_uuid=subscription_id)
    item_repository.find_items.return_value = [item]

    scope = ChatScope(subscription_ids=[subscription_id])

    result = await resolve_scope_candidate_item_ids(
        scope=scope, user_id=user_id, item_repository=item_repository, topic_repository=topic_repository,
    )

    assert result == {item.uuid}
    topic_repository.find_topics.assert_not_called()
    item_repository.find_interactions.assert_not_called()

    call = item_repository.find_items.call_args
    criteria: ItemFilterCriteria = call.kwargs["criteria"]
    assert criteria.subscription_ids == [subscription_id]
    assert criteria.interactions_from_user == user_id
    assert call.kwargs["limit"] == MAX_SCOPE_CANDIDATE_ITEMS


@pytest.mark.asyncio()
async def test_resolve_scope_with_topic_ids_resolves_their_subscriptions() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    topic_repository = AsyncMock(spec=TopicRepository)

    sub_a, sub_b = uuid.uuid4(), uuid.uuid4()
    topic = mock_topic(subscription_uuids=[sub_a, sub_b])
    topic_repository.find_topics.return_value = [topic]
    item_repository.find_items.return_value = []

    scope = ChatScope(topic_ids=[topic.uuid])

    await resolve_scope_candidate_item_ids(
        scope=scope, user_id=None, item_repository=item_repository, topic_repository=topic_repository,
    )

    topic_repository.find_topics.assert_called_once_with([topic.uuid])
    criteria: ItemFilterCriteria = item_repository.find_items.call_args.kwargs["criteria"]
    assert set(criteria.subscription_ids or []) == {sub_a, sub_b}


@pytest.mark.asyncio()
async def test_resolve_scope_excludes_subscriptions_from_topic() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    topic_repository = AsyncMock(spec=TopicRepository)

    sub_a, sub_b = uuid.uuid4(), uuid.uuid4()
    topic = mock_topic(subscription_uuids=[sub_a, sub_b])
    topic_repository.find_topics.return_value = [topic]
    item_repository.find_items.return_value = []

    scope = ChatScope(topic_ids=[topic.uuid], excluded_subscriptions=[sub_a])

    await resolve_scope_candidate_item_ids(
        scope=scope, user_id=None, item_repository=item_repository, topic_repository=topic_repository,
    )

    criteria: ItemFilterCriteria = item_repository.find_items.call_args.kwargs["criteria"]
    assert criteria.subscription_ids == [sub_b]


@pytest.mark.asyncio()
async def test_resolve_scope_with_curator_ids_uses_interaction_repository() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    topic_repository = AsyncMock(spec=TopicRepository)

    curator_id = uuid.uuid4()
    interaction = mock_interaction(interaction_type=InteractionType.RECOMMENDED)
    item_repository.find_interactions.return_value = [interaction]

    scope = ChatScope(curator_ids=[curator_id], text_search="cooking", min_duration=60, max_duration=600)

    result = await resolve_scope_candidate_item_ids(
        scope=scope, user_id=None, item_repository=item_repository, topic_repository=topic_repository,
    )

    assert result == {interaction.item_uuid}
    item_repository.find_items.assert_not_called()

    criteria: InteractionFilterCriteria = item_repository.find_interactions.call_args.kwargs["criteria"]
    assert criteria.user_ids == [curator_id]
    assert criteria.interaction_types == [InteractionType.RECOMMENDED]
    assert criteria.text == "cooking"
    assert criteria.min_duration == 60
    assert criteria.max_duration == 600


@pytest.mark.asyncio()
async def test_resolve_scope_combines_subscription_and_curator_results() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    topic_repository = AsyncMock(spec=TopicRepository)

    subscription_id = uuid.uuid4()
    curator_id = uuid.uuid4()
    sub_item = mock_item(sub_uuid=subscription_id)
    curator_interaction = mock_interaction()

    item_repository.find_items.return_value = [sub_item]
    item_repository.find_interactions.return_value = [curator_interaction]

    scope = ChatScope(subscription_ids=[subscription_id], curator_ids=[curator_id])

    result = await resolve_scope_candidate_item_ids(
        scope=scope, user_id=None, item_repository=item_repository, topic_repository=topic_repository,
    )

    assert result == {sub_item.uuid, curator_interaction.item_uuid}


@pytest.mark.asyncio()
async def test_resolve_scope_with_no_ids_queries_nothing() -> None:
    item_repository = AsyncMock(spec=ItemRepository)
    topic_repository = AsyncMock(spec=TopicRepository)

    scope = ChatScope()

    result = await resolve_scope_candidate_item_ids(
        scope=scope, user_id=None, item_repository=item_repository, topic_repository=topic_repository,
    )

    assert result == set()
    item_repository.find_items.assert_not_called()
    item_repository.find_interactions.assert_not_called()
