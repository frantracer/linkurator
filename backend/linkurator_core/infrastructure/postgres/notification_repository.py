from __future__ import annotations

from datetime import datetime
from ipaddress import IPv4Address
from typing import Any
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
from linkurator_core.domain.notifications.notification_repository import NotificationRepository
from linkurator_core.infrastructure.postgres.common import PostgresConnector


class CuratorContent(BaseModel):
    username: str
    avatar_url: AnyUrl


class SubscriptionContent(BaseModel):
    uuid: UUID
    name: str
    thumbnail: AnyUrl
    provider: ItemProvider


class ItemContent(BaseModel):
    name: str
    url: AnyUrl
    thumbnail: AnyUrl
    duration: Seconds | None
    published_at: datetime
    subscription: SubscriptionContent


class NotificationContent(BaseModel):
    curator: CuratorContent
    item: ItemContent


def _domain_to_content(notification: Notification) -> NotificationContent:
    return NotificationContent(
        curator=CuratorContent(
            username=notification.curator.username,
            avatar_url=notification.curator.avatar_url,
        ),
        item=ItemContent(
            name=notification.item.name,
            url=notification.item.url,
            thumbnail=notification.item.thumbnail,
            duration=notification.item.duration,
            published_at=notification.item.published_at,
            subscription=SubscriptionContent(
                uuid=notification.item.subscription.uuid,
                name=notification.item.subscription.name,
                thumbnail=notification.item.subscription.thumbnail,
                provider=notification.item.subscription.provider,
            ),
        ),
    )


def _row_to_domain(row: Any) -> Notification:
    content = NotificationContent.model_validate(row["content"])
    return Notification(
        uuid=row["uuid"],
        user_id=row["user_id"],
        type=NotificationType(row["type"]),
        curator=NotificationCurator(
            uuid=row["curator_id"],
            username=content.curator.username,
            avatar_url=content.curator.avatar_url,
        ),
        item=NotificationItem(
            uuid=row["item_id"],
            name=content.item.name,
            url=content.item.url,
            thumbnail=content.item.thumbnail,
            duration=content.item.duration,
            published_at=content.item.published_at,
            subscription=NotificationSubscription(
                uuid=content.item.subscription.uuid,
                name=content.item.subscription.name,
                thumbnail=content.item.subscription.thumbnail,
                provider=content.item.subscription.provider,
            ),
        ),
        created_at=row["created_at"],
        read_at=row["read_at"],
    )


class PostgresNotificationRepository(NotificationRepository):
    def __init__(self, ip: IPv4Address, port: int, db_name: str, username: str, password: str) -> None:
        super().__init__()
        self._connector = PostgresConnector(ip, port, db_name, username, password)

    async def add(self, notifications: list[Notification]) -> None:
        if len(notifications) == 0:
            return
        pool = await self._connector.pool()
        await pool.executemany(
            """
            INSERT INTO notifications (uuid, user_id, type, curator_id, item_id, content, created_at, read_at)
            VALUES (%s, %s, %s, %s, %s, %s::jsonb, %s, %s)
            ON CONFLICT (user_id, curator_id, item_id) DO NOTHING
            """,
            [
                (
                    notification.uuid,
                    notification.user_id,
                    notification.type.value,
                    notification.curator.uuid,
                    notification.item.uuid,
                    _domain_to_content(notification).model_dump_json(),
                    notification.created_at,
                    notification.read_at,
                )
                for notification in notifications
            ],
        )

    async def find_by_user(self, user_id: UUID, page_number: int, page_size: int) -> list[Notification]:
        pool = await self._connector.pool()
        rows = await pool.fetch(
            """
            SELECT * FROM notifications
            WHERE user_id = %s
            ORDER BY created_at DESC, uuid DESC
            LIMIT %s OFFSET %s
            """,
            user_id, page_size, page_number * page_size,
        )
        return [_row_to_domain(row) for row in rows]

    async def count_unread(self, user_id: UUID) -> int:
        pool = await self._connector.pool()
        return await pool.fetchval(
            "SELECT COUNT(*) FROM notifications WHERE user_id = %s AND read_at IS NULL",
            user_id,
        )

    async def mark_all_as_read(self, user_id: UUID, read_at: datetime) -> None:
        pool = await self._connector.pool()
        await pool.execute(
            "UPDATE notifications SET read_at = %s WHERE user_id = %s AND read_at IS NULL",
            read_at, user_id,
        )

    async def delete_by_user(self, user_id: UUID) -> None:
        pool = await self._connector.pool()
        await pool.execute("DELETE FROM notifications WHERE user_id = %s", user_id)

    async def delete_all(self) -> None:
        pool = await self._connector.pool()
        await pool.execute("DELETE FROM notifications")
