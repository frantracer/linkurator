import uuid
from unittest.mock import AsyncMock, Mock

import pytest

from linkurator_core.domain.chats.chat import ChatScope
from linkurator_core.domain.common.mock_factory import mock_topic
from linkurator_core.infrastructure.ai_agents.recommendations_agent import (
    RecommendationsDependencies,
    build_find_items_by_keywords_criteria,
    build_find_subscriptions_items_criteria,
    short_id,
)


def _make_deps(**overrides: object) -> RecommendationsDependencies:
    defaults: dict[str, object] = {
        "user_uuid": None,
        "user_repository": Mock(),
        "subscription_repository": Mock(),
        "item_repository": Mock(),
        "topic_repository": Mock(),
        "keyword_generator_agent": Mock(),
        "previous_chat": None,
    }
    defaults.update(overrides)
    return RecommendationsDependencies(**defaults)  # type: ignore[arg-type]


def test_is_scoped_false_when_no_scope() -> None:
    deps = _make_deps()
    assert deps.is_scoped() is False


def test_is_scoped_false_when_scope_has_no_entity_restriction() -> None:
    deps = _make_deps(scope=ChatScope())
    assert deps.is_scoped() is False


def test_is_scoped_true_when_scope_has_entity_restriction() -> None:
    deps = _make_deps(scope=ChatScope(topic_ids=[uuid.uuid4()]))
    assert deps.is_scoped() is True


@pytest.mark.asyncio()
async def test_build_find_subscriptions_items_criteria_unscoped_uses_llm_provided_ids() -> None:
    sub_id = uuid.uuid4()
    topic = mock_topic(subscription_uuids=[uuid.uuid4()])
    topic_repository = AsyncMock()
    topic_repository.find_topics.return_value = [topic]
    deps = _make_deps(user_uuid=uuid.uuid4(), topic_repository=topic_repository)
    deps.register_subscription_id(sub_id)
    deps.register_topic(topic)

    criteria = await build_find_subscriptions_items_criteria(deps, [short_id(topic.uuid)], [short_id(sub_id)])

    topic_repository.find_topics.assert_awaited_once_with([topic.uuid])

    assert criteria.item_ids is None
    assert sub_id in (criteria.subscription_ids or [])
    assert topic.subscriptions_ids[0] in (criteria.subscription_ids or [])
    assert criteria.interactions_from_user == deps.user_uuid
    assert criteria.interactions.without_interactions is True


@pytest.mark.asyncio()
async def test_build_find_subscriptions_items_criteria_scoped_ignores_llm_provided_ids() -> None:
    candidate_ids = {uuid.uuid4(), uuid.uuid4()}
    topic_repository = AsyncMock()
    deps = _make_deps(
        scope=ChatScope(topic_ids=[uuid.uuid4()]),
        candidate_item_ids=candidate_ids,
        topic_repository=topic_repository,
    )

    criteria = await build_find_subscriptions_items_criteria(deps, [str(uuid.uuid4())], [str(uuid.uuid4())])

    assert criteria.item_ids == candidate_ids
    assert criteria.subscription_ids is None
    topic_repository.find_topics.assert_not_awaited()


@pytest.mark.asyncio()
async def test_build_find_subscriptions_items_criteria_scoped_with_no_candidates_matches_nothing() -> None:
    deps = _make_deps(scope=ChatScope(topic_ids=[uuid.uuid4()]))

    criteria = await build_find_subscriptions_items_criteria(deps, None, None)

    assert criteria.item_ids == set()


def test_build_find_items_by_keywords_criteria_unscoped_is_text_only() -> None:
    deps = _make_deps()

    criteria = build_find_items_by_keywords_criteria(deps, "cooking")

    assert criteria.text == "cooking"
    assert criteria.item_ids is None


def test_build_find_items_by_keywords_criteria_scoped_ands_candidate_ids() -> None:
    candidate_ids = {uuid.uuid4()}
    deps = _make_deps(
        scope=ChatScope(subscription_ids=[uuid.uuid4()]),
        candidate_item_ids=candidate_ids,
    )

    criteria = build_find_items_by_keywords_criteria(deps, "cooking")

    assert criteria.text == "cooking"
    assert criteria.item_ids == candidate_ids


@pytest.mark.asyncio()
async def test_build_find_subscriptions_items_criteria_entityless_scope_applies_filters_but_keeps_llm_ids() -> None:
    user_id = uuid.uuid4()
    topic_repository = AsyncMock()
    topic_repository.find_topics.return_value = []
    deps = _make_deps(
        user_uuid=user_id,
        topic_repository=topic_repository,
        scope=ChatScope(
            text_search="rust",
            min_duration=300,
            max_duration=1200,
            include_items_without_interactions=True,
            include_recommended_items=False,
            include_discouraged_items=False,
            include_viewed_items=True,
            include_hidden_items=False,
        ),
    )
    sub_id = uuid.uuid4()

    criteria = await build_find_subscriptions_items_criteria(deps, None, [str(sub_id)])

    assert criteria.item_ids is None
    assert criteria.subscription_ids == [sub_id]
    assert criteria.text == "rust"
    assert criteria.min_duration == 300
    assert criteria.max_duration == 1200
    assert criteria.interactions_from_user == user_id
    assert criteria.interactions.without_interactions is True
    assert criteria.interactions.viewed is True
    assert criteria.interactions.recommended is False
    assert criteria.interactions.hidden is False


def test_build_find_items_by_keywords_criteria_entityless_scope_applies_filters_and_keeps_keyword() -> None:
    user_id = uuid.uuid4()
    deps = _make_deps(
        user_uuid=user_id,
        scope=ChatScope(text_search="rust", min_duration=60, include_hidden_items=False),
    )

    criteria = build_find_items_by_keywords_criteria(deps, "cooking")

    assert criteria.text == "cooking"
    assert criteria.item_ids is None
    assert criteria.min_duration == 60
    assert criteria.interactions_from_user == user_id
    assert criteria.interactions.hidden is False


def test_build_find_items_by_keywords_criteria_without_scope_has_no_filters() -> None:
    deps = _make_deps(user_uuid=uuid.uuid4())

    criteria = build_find_items_by_keywords_criteria(deps, "cooking")

    assert criteria.min_duration is None
    assert criteria.max_duration is None
    assert criteria.interactions_from_user is None
