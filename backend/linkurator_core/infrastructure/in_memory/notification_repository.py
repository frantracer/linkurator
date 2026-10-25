from __future__ import annotations

from copy import copy
from datetime import datetime
from uuid import UUID

from linkurator_core.domain.notifications.notification import Notification
from linkurator_core.domain.notifications.notification_repository import NotificationRepository


class InMemoryNotificationRepository(NotificationRepository):
    def __init__(self) -> None:
        super().__init__()
        self.notifications: dict[UUID, Notification] = {}

    async def add(self, notifications: list[Notification]) -> None:
        notified = {(n.user_id, n.curator.uuid, n.item.uuid) for n in self.notifications.values()}
        for notification in notifications:
            key = (notification.user_id, notification.curator.uuid, notification.item.uuid)
            if key in notified:
                continue
            notified.add(key)
            self.notifications[notification.uuid] = copy(notification)

    async def find_by_user(self, user_id: UUID, page_number: int, page_size: int) -> list[Notification]:
        user_notifications = sorted(
            [n for n in self.notifications.values() if n.user_id == user_id],
            key=lambda n: (n.created_at, n.uuid),
            reverse=True,
        )
        start = page_number * page_size
        return [copy(n) for n in user_notifications[start:start + page_size]]

    async def count_unread(self, user_id: UUID) -> int:
        return len([n for n in self.notifications.values() if n.user_id == user_id and not n.is_read()])

    async def mark_all_as_read(self, user_id: UUID, read_at: datetime) -> None:
        for notification in self.notifications.values():
            if notification.user_id == user_id and not notification.is_read():
                notification.read_at = read_at

    async def delete_by_user(self, user_id: UUID) -> None:
        self.notifications = {
            uuid: n for uuid, n in self.notifications.items() if n.user_id != user_id
        }

    async def delete_all(self) -> None:
        self.notifications = {}
