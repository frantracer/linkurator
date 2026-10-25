from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import AnyUrl

from linkurator_core.domain.common.units import Seconds
from linkurator_core.domain.items.item import Item, ItemProvider
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.domain.users.user import User


class NotificationType(str, Enum):
    CURATOR_RECOMMENDED_ITEM = "curator_recommended_item"


@dataclass
class NotificationCurator:
    uuid: UUID
    username: str
    avatar_url: AnyUrl


@dataclass
class NotificationSubscription:
    uuid: UUID
    name: str
    thumbnail: AnyUrl
    provider: ItemProvider


@dataclass
class NotificationItem:
    uuid: UUID
    name: str
    url: AnyUrl
    thumbnail: AnyUrl
    duration: Seconds | None
    published_at: datetime
    subscription: NotificationSubscription


@dataclass
class Notification:
    uuid: UUID
    user_id: UUID
    type: NotificationType
    curator: NotificationCurator
    item: NotificationItem
    created_at: datetime
    read_at: datetime | None

    @classmethod
    def new_curator_recommended_item(
            cls,
            uuid: UUID,
            user_id: UUID,
            curator: User,
            item: Item,
            subscription: Subscription,
            created_at: datetime,
    ) -> Notification:
        return cls(
            uuid=uuid,
            user_id=user_id,
            type=NotificationType.CURATOR_RECOMMENDED_ITEM,
            curator=NotificationCurator(
                uuid=curator.uuid,
                username=str(curator.username),
                avatar_url=curator.avatar_url,
            ),
            item=NotificationItem(
                uuid=item.uuid,
                name=item.name,
                url=item.url,
                thumbnail=item.thumbnail,
                duration=item.duration,
                published_at=item.published_at,
                subscription=NotificationSubscription(
                    uuid=subscription.uuid,
                    name=subscription.name,
                    thumbnail=subscription.thumbnail,
                    provider=subscription.provider,
                ),
            ),
            created_at=created_at,
            read_at=None,
        )

    def is_read(self) -> bool:
        return self.read_at is not None
