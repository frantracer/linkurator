from datetime import datetime, timezone
from uuid import UUID

import pytest

from linkurator_core.application.notifications.count_unread_notifications_handler import (
    CountUnreadNotificationsHandler,
)
from linkurator_core.application.notifications.get_user_notifications_handler import GetUserNotificationsHandler
from linkurator_core.application.notifications.mark_all_notifications_as_read_handler import (
    MarkAllNotificationsAsReadHandler,
)
from linkurator_core.domain.common.mock_factory import mock_notification
from linkurator_core.infrastructure.in_memory.notification_repository import InMemoryNotificationRepository

USER_ID = UUID("6c5d4e3f-2a1b-4c0d-9e8f-7a6b5c4d3e2f")
READ_AT = datetime(2026, 10, 17, 12, 0, 0, tzinfo=timezone.utc)


@pytest.mark.asyncio()
async def test_get_user_notifications_returns_only_the_user_notifications() -> None:
    notification_repository = InMemoryNotificationRepository()
    notification = mock_notification(user_id=USER_ID)
    await notification_repository.add([notification, mock_notification()])

    handler = GetUserNotificationsHandler(notification_repository=notification_repository)

    assert await handler.handle(user_id=USER_ID, page_number=0, page_size=10) == [notification]


@pytest.mark.asyncio()
async def test_mark_all_notifications_as_read_only_affects_the_user_notifications() -> None:
    notification_repository = InMemoryNotificationRepository()
    other_user_notification = mock_notification()
    await notification_repository.add([
        mock_notification(user_id=USER_ID), mock_notification(user_id=USER_ID), other_user_notification,
    ])
    assert await CountUnreadNotificationsHandler(notification_repository).handle(USER_ID) == 2

    await MarkAllNotificationsAsReadHandler(notification_repository, date_generator=lambda: READ_AT).handle(USER_ID)

    assert await CountUnreadNotificationsHandler(notification_repository).handle(USER_ID) == 0
    assert all(n.read_at == READ_AT for n in await notification_repository.find_by_user(USER_ID, 0, 10))
    assert await notification_repository.count_unread(other_user_notification.user_id) == 1
