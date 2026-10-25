from datetime import datetime, timezone
from uuid import UUID

import pytest

from linkurator_core.application.notifications.notify_followers_of_recommendation_handler import (
    NotifyFollowersOfRecommendationHandler,
)
from linkurator_core.domain.common.mock_factory import mock_interaction, mock_item, mock_sub, mock_user
from linkurator_core.domain.items.interaction import InteractionType
from linkurator_core.domain.notifications.notification import NotificationType
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository
from linkurator_core.infrastructure.in_memory.notification_repository import InMemoryNotificationRepository
from linkurator_core.infrastructure.in_memory.subscription_repository import InMemorySubscriptionRepository
from linkurator_core.infrastructure.in_memory.user_repository import InMemoryUserRepository

CURATOR_ID = UUID("2f0c5c8e-6b1a-4d3e-9f2a-1b0c9d8e7f6a")
SUBSCRIPTION_ID = UUID("8a7b6c5d-4e3f-4a1b-9c0d-1e2f3a4b5c6d")
NOW = datetime(2026, 10, 17, 12, 0, 0, tzinfo=timezone.utc)


async def _setup(
        followers_subscriptions: list[set[UUID]],
        curator_interaction_type: InteractionType | None = InteractionType.RECOMMENDED,
) -> tuple[NotifyFollowersOfRecommendationHandler, InMemoryNotificationRepository, list[UUID], UUID]:
    user_repository = InMemoryUserRepository()
    item_repository = InMemoryItemRepository()
    subscription_repository = InMemorySubscriptionRepository()
    notification_repository = InMemoryNotificationRepository()

    await subscription_repository.add(mock_sub(uuid=SUBSCRIPTION_ID, name="Followed channel"))

    curator = mock_user(uuid=CURATOR_ID)
    await user_repository.add(curator)

    follower_ids = []
    for subscriptions in followers_subscriptions:
        follower = mock_user(subscribed_to=list(subscriptions), curators={CURATOR_ID})
        await user_repository.add(follower)
        follower_ids.append(follower.uuid)

    item = mock_item(sub_uuid=SUBSCRIPTION_ID, name="Recommended video", duration=125)
    await item_repository.upsert_items([item])
    if curator_interaction_type is not None:
        await item_repository.add_interaction(
            mock_interaction(user_id=CURATOR_ID, item_id=item.uuid, interaction_type=curator_interaction_type))

    handler = NotifyFollowersOfRecommendationHandler(
        user_repository=user_repository,
        item_repository=item_repository,
        subscription_repository=subscription_repository,
        notification_repository=notification_repository,
        date_generator=lambda: NOW,
    )
    return handler, notification_repository, follower_ids, item.uuid


@pytest.mark.asyncio()
async def test_followers_subscribed_to_the_item_subscription_are_notified() -> None:
    handler, notification_repository, follower_ids, item_id = await _setup(
        followers_subscriptions=[{SUBSCRIPTION_ID}, set()],
    )

    await handler.handle(curator_id=CURATOR_ID, item_id=item_id)

    subscribed_follower_notifications = await notification_repository.find_by_user(follower_ids[0], 0, 10)
    assert len(subscribed_follower_notifications) == 1
    notification = subscribed_follower_notifications[0]
    assert notification.type == NotificationType.CURATOR_RECOMMENDED_ITEM
    assert notification.curator.uuid == CURATOR_ID
    assert notification.curator.username == str(CURATOR_ID)
    assert notification.item.uuid == item_id
    assert notification.item.name == "Recommended video"
    assert notification.item.duration == 125
    assert notification.item.subscription.uuid == SUBSCRIPTION_ID
    assert notification.item.subscription.name == "Followed channel"
    assert notification.created_at == NOW
    assert not notification.is_read()

    assert await notification_repository.find_by_user(follower_ids[1], 0, 10) == []


@pytest.mark.asyncio()
async def test_no_notification_when_the_curator_no_longer_recommends_the_item() -> None:
    handler, notification_repository, follower_ids, item_id = await _setup(
        followers_subscriptions=[{SUBSCRIPTION_ID}],
        curator_interaction_type=None,
    )

    await handler.handle(curator_id=CURATOR_ID, item_id=item_id)

    assert await notification_repository.find_by_user(follower_ids[0], 0, 10) == []


@pytest.mark.asyncio()
async def test_no_notification_for_unknown_item() -> None:
    handler, notification_repository, follower_ids, _ = await _setup(followers_subscriptions=[{SUBSCRIPTION_ID}])

    await handler.handle(curator_id=CURATOR_ID, item_id=UUID("0b1c2d3e-4f5a-4b6c-8d7e-9f0a1b2c3d4e"))

    assert await notification_repository.find_by_user(follower_ids[0], 0, 10) == []


@pytest.mark.asyncio()
async def test_recommending_the_same_item_again_does_not_duplicate_notifications() -> None:
    handler, notification_repository, follower_ids, item_id = await _setup(
        followers_subscriptions=[{SUBSCRIPTION_ID}],
    )

    await handler.handle(curator_id=CURATOR_ID, item_id=item_id)
    await handler.handle(curator_id=CURATOR_ID, item_id=item_id)

    assert len(await notification_repository.find_by_user(follower_ids[0], 0, 10)) == 1


@pytest.mark.asyncio()
async def test_notification_keeps_the_item_details_after_the_item_is_deleted() -> None:
    handler, notification_repository, follower_ids, item_id = await _setup(
        followers_subscriptions=[{SUBSCRIPTION_ID}],
    )
    await handler.handle(curator_id=CURATOR_ID, item_id=item_id)

    await handler.item_repository.delete_item(item_id)

    notifications = await notification_repository.find_by_user(follower_ids[0], 0, 10)
    assert [n.item.name for n in notifications] == ["Recommended video"]
