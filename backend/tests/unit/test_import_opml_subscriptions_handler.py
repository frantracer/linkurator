import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

from linkurator_core.application.subscriptions.import_opml_subscriptions_handler import (
    ImportOpmlSubscriptionsHandler,
)
from linkurator_core.domain.common.event_bus_service import EventBusService
from linkurator_core.domain.common.mock_factory import mock_sub, mock_user
from linkurator_core.domain.subscriptions.general_subscription_service import GeneralSubscriptionService
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.users.user_repository import UserRepository
from linkurator_core.infrastructure.in_memory.subscription_repository import InMemorySubscriptionRepository
from linkurator_core.infrastructure.in_memory.topic_repository import InMemoryTopicRepository
from linkurator_core.infrastructure.in_memory.user_repository import InMemoryUserRepository

GROUPED_OPML = """<?xml version="1.0"?>
<opml version="2.0">
    <body>
        <outline text="News">
            <outline text="Feed One" xmlUrl="https://example.com/feed1.xml"/>
            <outline text="Feed Two" xmlUrl="https://example.com/feed2.xml"/>
        </outline>
        <outline text="Standalone Feed" xmlUrl="https://example.com/feed3.xml"/>
    </body>
</opml>
"""


@pytest.mark.asyncio()
async def test_import_opml_creates_subscriptions_topics_and_follows_them() -> None:
    sub1 = mock_sub(url="https://example.com/feed1.xml", provider="rss")
    sub2 = mock_sub(url="https://example.com/feed2.xml", provider="rss")
    sub3 = mock_sub(url="https://example.com/feed3.xml", provider="rss")
    subs_by_url = {str(sub1.url): sub1, str(sub2.url): sub2, str(sub3.url): sub3}

    subscription_service = AsyncMock(spec=GeneralSubscriptionService)
    subscription_service.get_subscription_from_url.side_effect = (
        lambda url, provider: subs_by_url[str(url)]
    )

    subscription_repository = InMemorySubscriptionRepository()
    topic_repository = InMemoryTopicRepository()
    user_repository = InMemoryUserRepository()
    user = mock_user()
    await user_repository.add(user)

    event_bus_service = AsyncMock(spec=EventBusService)
    handler = ImportOpmlSubscriptionsHandler(
        subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        topic_repository=topic_repository,
        event_bus_service=event_bus_service)

    result = await handler.handle(user_id=user.uuid, opml_content=GROUPED_OPML, create_topics=True)

    assert result.imported == 3
    assert result.already_followed == 0
    assert result.failed == 0
    assert result.topics_created == 1

    updated_user = await user_repository.get(user.uuid)
    assert updated_user is not None
    assert sub1.uuid in updated_user.get_subscriptions()
    assert sub2.uuid in updated_user.get_subscriptions()
    assert sub3.uuid in updated_user.get_subscriptions()

    topics = await topic_repository.get_by_user_id(user.uuid)
    assert len(topics) == 1
    assert topics[0].name == "News"
    assert set(topics[0].subscriptions_ids) == {sub1.uuid, sub2.uuid}

    assert event_bus_service.publish.call_count == 3


@pytest.mark.asyncio()
async def test_import_opml_without_create_topics_does_not_create_topics() -> None:
    sub1 = mock_sub(url="https://example.com/feed1.xml", provider="rss")

    subscription_service = AsyncMock(spec=GeneralSubscriptionService)
    subscription_service.get_subscription_from_url.return_value = sub1

    subscription_repository = InMemorySubscriptionRepository()
    topic_repository = InMemoryTopicRepository()
    user_repository = InMemoryUserRepository()
    user = mock_user()
    await user_repository.add(user)

    event_bus_service = AsyncMock(spec=EventBusService)
    handler = ImportOpmlSubscriptionsHandler(
        subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        topic_repository=topic_repository,
        event_bus_service=event_bus_service)

    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="News">
                <outline text="Feed One" xmlUrl="https://example.com/feed1.xml"/>
            </outline>
        </body>
    </opml>
    """
    result = await handler.handle(user_id=user.uuid, opml_content=opml, create_topics=False)

    assert result.imported == 1
    assert result.topics_created == 0
    assert await topic_repository.get_by_user_id(user.uuid) == []


@pytest.mark.asyncio()
async def test_import_opml_counts_already_followed_subscription() -> None:
    sub1 = mock_sub(url="https://example.com/feed1.xml", provider="rss")

    subscription_service = AsyncMock(spec=GeneralSubscriptionService)
    subscription_service.get_subscription_from_url.return_value = sub1

    subscription_repository = InMemorySubscriptionRepository()
    await subscription_repository.add(sub1)

    user_repository = InMemoryUserRepository()
    user = mock_user(subscribed_to=[sub1.uuid])
    await user_repository.add(user)

    handler = ImportOpmlSubscriptionsHandler(
        subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        topic_repository=InMemoryTopicRepository(),
        event_bus_service=AsyncMock(spec=EventBusService))

    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="Feed One" xmlUrl="https://example.com/feed1.xml"/>
        </body>
    </opml>
    """
    result = await handler.handle(user_id=user.uuid, opml_content=opml, create_topics=True)

    assert result.imported == 0
    assert result.already_followed == 1
    assert result.failed == 0


@pytest.mark.asyncio()
async def test_import_opml_counts_failed_feed() -> None:
    subscription_service = AsyncMock(spec=GeneralSubscriptionService)
    subscription_service.get_subscription_from_url.return_value = None

    user_repository = InMemoryUserRepository()
    user = mock_user()
    await user_repository.add(user)

    handler = ImportOpmlSubscriptionsHandler(
        subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=InMemorySubscriptionRepository(),
        topic_repository=InMemoryTopicRepository(),
        event_bus_service=AsyncMock(spec=EventBusService))

    opml = """<?xml version="1.0"?>
    <opml version="2.0">
        <body>
            <outline text="Broken Feed" xmlUrl="https://example.com/broken.xml"/>
        </body>
    </opml>
    """
    result = await handler.handle(user_id=user.uuid, opml_content=opml, create_topics=True)

    assert result.imported == 0
    assert result.failed == 1
    assert result.topics_created == 0


@pytest.mark.asyncio()
async def test_import_opml_for_non_existing_user_does_nothing() -> None:
    subscription_service = AsyncMock(spec=GeneralSubscriptionService)
    subscription_repository = MagicMock(spec=SubscriptionRepository)
    user_repository = MagicMock(spec=UserRepository)
    user_repository.get.return_value = None

    handler = ImportOpmlSubscriptionsHandler(
        subscription_service=subscription_service,
        user_repository=user_repository,
        subscription_repository=subscription_repository,
        topic_repository=InMemoryTopicRepository(),
        event_bus_service=AsyncMock(spec=EventBusService))

    user_id = uuid.UUID("3577da9f-2d85-4475-9aaf-5f38cd01bc2a")
    result = await handler.handle(user_id=user_id, opml_content=GROUPED_OPML, create_topics=True)

    assert result.imported == 0
    assert subscription_service.get_subscription_from_url.call_count == 0
    assert user_repository.update.call_count == 0
