import uuid
from unittest.mock import AsyncMock

import pytest
from pydantic_ai.models.test import TestModel
from pydantic_ai.usage import RunUsage

from linkurator_core.domain.chats.chat import ChatScope
from linkurator_core.domain.common.mock_factory import (
    mock_chat,
    mock_chat_message,
    mock_item,
    mock_sub,
)
from linkurator_core.domain.items.item_repository import ItemFilterCriteria, ItemRepository
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user_repository import UserRepository
from linkurator_core.infrastructure.ai_agents.recommendations_agent import RecommendationsAgent


@pytest.mark.asyncio()
async def test_scoped_query_constrains_every_tool_call_to_candidate_items() -> None:
    """
    End-to-end run of RecommendationsAgent with a fake model, exercising the real system
    prompts and tool bodies rather than the extracted pure functions in isolation.

    Regardless of what the fake model's tool calls ask for, every item lookup after the scope
    is resolved must be constrained to the pre-resolved candidate item set.
    """
    sub = mock_sub()
    item = mock_item(sub_uuid=sub.uuid)

    item_repository = AsyncMock(spec=ItemRepository)
    item_repository.find_items.return_value = [item]
    subscription_repository = AsyncMock(spec=SubscriptionRepository)
    subscription_repository.get_list.return_value = [sub]
    topic_repository = AsyncMock(spec=TopicRepository)
    topic_repository.find_topics.return_value = []
    user_repository = AsyncMock(spec=UserRepository)
    user_repository.get.return_value = None

    agent = RecommendationsAgent(
        model=TestModel(),
        base_url="https://linkurator.com",
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        item_repository=item_repository,
        topic_repository=topic_repository,
    )

    scope = ChatScope(topic_ids=[uuid.uuid4()])
    chat = mock_chat(messages=[mock_chat_message(scope=scope)])

    await agent.query(query="Recommend me something", user_id=None, previous_chat=chat, usage=RunUsage())

    calls = item_repository.find_items.call_args_list
    # The first call resolves the candidate items; every tool call after it must be limited to them.
    assert len(calls) >= 3
    resolution_call, *tool_calls = calls
    assert resolution_call.kwargs["criteria"].item_ids is None
    assert len(tool_calls) >= 2

    for call in tool_calls:
        criteria: ItemFilterCriteria = call.kwargs["criteria"]
        assert criteria.item_ids == {item.uuid}
        assert criteria.subscription_ids is None


@pytest.mark.asyncio()
async def test_unscoped_query_lets_the_model_pick_subscriptions_and_keywords() -> None:
    sub = mock_sub()
    item = mock_item(sub_uuid=sub.uuid)

    item_repository = AsyncMock(spec=ItemRepository)
    item_repository.find_items.return_value = [item]
    subscription_repository = AsyncMock(spec=SubscriptionRepository)
    subscription_repository.get_list.return_value = [sub]
    topic_repository = AsyncMock(spec=TopicRepository)
    topic_repository.find_topics.return_value = []
    topic_repository.get_by_user_id.return_value = []
    user_repository = AsyncMock(spec=UserRepository)
    user_repository.get.return_value = None

    agent = RecommendationsAgent(
        model=TestModel(),
        base_url="https://linkurator.com",
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        item_repository=item_repository,
        topic_repository=topic_repository,
    )

    await agent.query(query="Recommend me something", user_id=None, previous_chat=None, usage=RunUsage())

    calls = item_repository.find_items.call_args_list
    assert len(calls) >= 2
    for call in calls:
        criteria: ItemFilterCriteria = call.kwargs["criteria"]
        assert criteria.item_ids is None
