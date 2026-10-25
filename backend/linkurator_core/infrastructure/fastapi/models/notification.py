from __future__ import annotations

from uuid import UUID

from pydantic import AnyUrl, BaseModel

from linkurator_core.domain.common.units import Seconds
from linkurator_core.domain.items.item import ItemProvider
from linkurator_core.domain.notifications.notification import (
    Notification,
    NotificationCurator,
    NotificationItem,
    NotificationSubscription,
    NotificationType,
)
from linkurator_core.infrastructure.fastapi.models.schema import Iso8601Datetime


class NotificationCuratorSchema(BaseModel):
    id: UUID
    username: str
    avatar_url: AnyUrl

    @classmethod
    def from_domain(cls, curator: NotificationCurator) -> NotificationCuratorSchema:
        return cls(
            id=curator.uuid,
            username=curator.username,
            avatar_url=curator.avatar_url,
        )


class NotificationSubscriptionSchema(BaseModel):
    id: UUID
    name: str
    thumbnail: AnyUrl
    provider: ItemProvider

    @classmethod
    def from_domain(cls, subscription: NotificationSubscription) -> NotificationSubscriptionSchema:
        return cls(
            id=subscription.uuid,
            name=subscription.name,
            thumbnail=subscription.thumbnail,
            provider=subscription.provider,
        )


class NotificationItemSchema(BaseModel):
    id: UUID
    name: str
    url: AnyUrl
    thumbnail: AnyUrl
    duration: Seconds | None
    published_at: Iso8601Datetime
    subscription: NotificationSubscriptionSchema

    @classmethod
    def from_domain(cls, item: NotificationItem) -> NotificationItemSchema:
        return cls(
            id=item.uuid,
            name=item.name,
            url=item.url,
            thumbnail=item.thumbnail,
            duration=item.duration,
            published_at=item.published_at,
            subscription=NotificationSubscriptionSchema.from_domain(item.subscription),
        )


class NotificationSchema(BaseModel):
    """Notification sent to a user, e.g. when a followed curator recommends an item"""

    id: UUID
    type: NotificationType
    curator: NotificationCuratorSchema
    item: NotificationItemSchema
    created_at: Iso8601Datetime
    read: bool

    @classmethod
    def from_domain(cls, notification: Notification) -> NotificationSchema:
        return cls(
            id=notification.uuid,
            type=notification.type,
            curator=NotificationCuratorSchema.from_domain(notification.curator),
            item=NotificationItemSchema.from_domain(notification.item),
            created_at=notification.created_at,
            read=notification.is_read(),
        )


class UnreadNotificationsCountSchema(BaseModel):
    count: int
