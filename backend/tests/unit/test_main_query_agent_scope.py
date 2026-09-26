import uuid
from unittest.mock import AsyncMock, Mock

import pytest
from pydantic_ai.usage import RunUsage

from linkurator_core.domain.chats.chat import ChatRole, ChatScope
from linkurator_core.domain.common.mock_factory import mock_chat, mock_chat_message
from linkurator_core.domain.items.item_repository import ItemRepository
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user_repository import UserRepository
from linkurator_core.infrastructure.ai_agents.main_query_agent import MainQueryAgent, MainQueryAgentSubAgents


def _make_agent() -> MainQueryAgent:
    return MainQueryAgent(
        user_repository=AsyncMock(spec=UserRepository),
        subscription_repository=AsyncMock(spec=SubscriptionRepository),
        item_repository=AsyncMock(spec=ItemRepository),
        topic_repository=AsyncMock(spec=TopicRepository),
        chat_repository=AsyncMock(),
        base_url="https://linkurator.com",
        model=None,
    )


@pytest.mark.asyncio()
async def test_perform_query_bypasses_router_when_chat_is_scoped() -> None:
    agent = _make_agent()
    router_agent = AsyncMock()
    recommendations_agent = AsyncMock()
    recommendations_agent.query.return_value = Mock(response="ok", items_uuids=[])
    agents = MainQueryAgentSubAgents(
        router_agent=router_agent,
        recommendations_agent=recommendations_agent,
        topic_manager_agent=AsyncMock(),
    )
    scoped_chat = mock_chat(messages=[mock_chat_message(scope=ChatScope(topic_ids=[uuid.uuid4()]))])

    await agent._perform_query(uuid.uuid4(), "hello", scoped_chat, RunUsage(), agents)

    router_agent.query.assert_not_called()
    recommendations_agent.query.assert_called_once()


@pytest.mark.asyncio()
async def test_perform_query_routes_normally_when_chat_is_not_scoped() -> None:
    agent = _make_agent()
    router_agent = AsyncMock()
    router_agent.query.return_value = Mock(agent_type="recommendations")
    recommendations_agent = AsyncMock()
    recommendations_agent.query.return_value = Mock(response="ok", items_uuids=[])
    agents = MainQueryAgentSubAgents(
        router_agent=router_agent,
        recommendations_agent=recommendations_agent,
        topic_manager_agent=AsyncMock(),
    )
    unscoped_chat = mock_chat()

    await agent._perform_query(uuid.uuid4(), "hello", unscoped_chat, RunUsage(), agents)

    router_agent.query.assert_called_once()
    recommendations_agent.query.assert_called_once()


@pytest.mark.asyncio()
async def test_perform_query_routes_normally_when_chat_is_none() -> None:
    agent = _make_agent()
    router_agent = AsyncMock()
    router_agent.query.return_value = Mock(agent_type="recommendations")
    recommendations_agent = AsyncMock()
    recommendations_agent.query.return_value = Mock(response="ok", items_uuids=[])
    agents = MainQueryAgentSubAgents(
        router_agent=router_agent,
        recommendations_agent=recommendations_agent,
        topic_manager_agent=AsyncMock(),
    )

    await agent._perform_query(uuid.uuid4(), "hello", None, RunUsage(), agents)

    router_agent.query.assert_called_once()


@pytest.mark.asyncio()
async def test_perform_query_routes_normally_when_scope_has_no_entity_restriction() -> None:
    agent = _make_agent()
    router_agent = AsyncMock()
    router_agent.query.return_value = Mock(agent_type="recommendations")
    recommendations_agent = AsyncMock()
    recommendations_agent.query.return_value = Mock(response="ok", items_uuids=[])
    agents = MainQueryAgentSubAgents(
        router_agent=router_agent,
        recommendations_agent=recommendations_agent,
        topic_manager_agent=AsyncMock(),
    )
    chat_with_empty_scope = mock_chat(messages=[mock_chat_message(scope=ChatScope())])

    await agent._perform_query(uuid.uuid4(), "hello", chat_with_empty_scope, RunUsage(), agents)

    router_agent.query.assert_called_once()


@pytest.mark.asyncio()
async def test_perform_query_uses_the_scope_of_the_latest_question_only() -> None:
    agent = _make_agent()
    router_agent = AsyncMock()
    router_agent.query.return_value = Mock(agent_type="recommendations")
    recommendations_agent = AsyncMock()
    recommendations_agent.query.return_value = Mock(response="ok", items_uuids=[])
    agents = MainQueryAgentSubAgents(
        router_agent=router_agent,
        recommendations_agent=recommendations_agent,
        topic_manager_agent=AsyncMock(),
    )
    # The first question was scoped to a topic, the latest one is not: the router must run again.
    chat = mock_chat(messages=[
        mock_chat_message(scope=ChatScope(topic_ids=[uuid.uuid4()])),
        mock_chat_message(role=ChatRole.ASSISTANT),
        mock_chat_message(scope=ChatScope()),
    ])

    await agent._perform_query(uuid.uuid4(), "hello", chat, RunUsage(), agents)

    router_agent.query.assert_called_once()
