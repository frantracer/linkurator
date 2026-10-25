from uuid import UUID

from linkurator_core.domain.common.types import DateGenerator
from linkurator_core.domain.common.utils import datetime_now
from linkurator_core.domain.notifications.notification_repository import NotificationRepository


class MarkAllNotificationsAsReadHandler:
    def __init__(
            self,
            notification_repository: NotificationRepository,
            date_generator: DateGenerator = datetime_now,
    ) -> None:
        self.notification_repository = notification_repository
        self.date_generator = date_generator

    async def handle(self, user_id: UUID) -> None:
        await self.notification_repository.mark_all_as_read(user_id=user_id, read_at=self.date_generator())
