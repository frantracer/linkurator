from uuid import UUID

from linkurator_core.domain.notifications.notification import Notification
from linkurator_core.domain.notifications.notification_repository import NotificationRepository


class GetUserNotificationsHandler:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self.notification_repository = notification_repository

    async def handle(self, user_id: UUID, page_number: int, page_size: int) -> list[Notification]:
        return await self.notification_repository.find_by_user(
            user_id=user_id, page_number=page_number, page_size=page_size)
