from uuid import UUID

from linkurator_core.domain.notifications.notification_repository import NotificationRepository


class CountUnreadNotificationsHandler:
    def __init__(self, notification_repository: NotificationRepository) -> None:
        self.notification_repository = notification_repository

    async def handle(self, user_id: UUID) -> int:
        return await self.notification_repository.count_unread(user_id)
