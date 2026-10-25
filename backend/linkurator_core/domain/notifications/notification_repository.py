import abc
from datetime import datetime
from uuid import UUID

from linkurator_core.domain.notifications.notification import Notification


class NotificationRepository(abc.ABC):
    @abc.abstractmethod
    async def add(self, notifications: list[Notification]) -> None:
        """Notifications for an already notified (user, curator, item) are ignored"""

    @abc.abstractmethod
    async def find_by_user(self, user_id: UUID, page_number: int, page_size: int) -> list[Notification]:
        """Newest notifications first"""

    @abc.abstractmethod
    async def count_unread(self, user_id: UUID) -> int: ...

    @abc.abstractmethod
    async def mark_all_as_read(self, user_id: UUID, read_at: datetime) -> None: ...

    @abc.abstractmethod
    async def delete_by_user(self, user_id: UUID) -> None: ...

    @abc.abstractmethod
    async def delete_all(self) -> None: ...
