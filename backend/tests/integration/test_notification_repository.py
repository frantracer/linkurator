from datetime import datetime, timedelta, timezone
from ipaddress import IPv4Address
from typing import Any
from uuid import UUID

import pytest

from linkurator_core.domain.common.mock_factory import mock_notification
from linkurator_core.domain.notifications.notification_repository import NotificationRepository
from linkurator_core.infrastructure.in_memory.notification_repository import InMemoryNotificationRepository
from linkurator_core.infrastructure.postgres.notification_repository import PostgresNotificationRepository

NOW = datetime(2026, 10, 17, 12, 0, 0, tzinfo=timezone.utc)


@pytest.fixture(name="notification_repo", scope="session", params=["in_memory", "postgresql"])
def fixture_notification_repo(db_name: str, request: Any) -> NotificationRepository:
    if request.param == "postgresql":
        return PostgresNotificationRepository(IPv4Address("127.0.0.1"), 5432, db_name, "develop", "develop")
    return InMemoryNotificationRepository()


@pytest.mark.asyncio()
async def test_find_by_user_returns_newest_first_and_paginates(notification_repo: NotificationRepository) -> None:
    user_id = UUID("b3c2d1e0-9f8a-4b7c-8d6e-5f4a3b2c1d0e")
    oldest = mock_notification(user_id=user_id, created_at=NOW - timedelta(hours=2))
    middle = mock_notification(user_id=user_id, created_at=NOW - timedelta(hours=1))
    newest = mock_notification(user_id=user_id, created_at=NOW)
    other_user = mock_notification(created_at=NOW)
    await notification_repo.add([oldest, newest, middle, other_user])

    first_page = await notification_repo.find_by_user(user_id, page_number=0, page_size=2)
    second_page = await notification_repo.find_by_user(user_id, page_number=1, page_size=2)

    assert [n.uuid for n in first_page] == [newest.uuid, middle.uuid]
    assert [n.uuid for n in second_page] == [oldest.uuid]
    assert first_page[0] == newest


@pytest.mark.asyncio()
async def test_add_ignores_already_notified_recommendations(notification_repo: NotificationRepository) -> None:
    user_id = UUID("c4d3e2f1-0a9b-4c8d-9e7f-6a5b4c3d2e1f")
    notification = mock_notification(user_id=user_id)
    duplicated = mock_notification(
        user_id=user_id, curator_id=notification.curator.uuid, item_id=notification.item.uuid)

    await notification_repo.add([notification])
    await notification_repo.add([duplicated])

    notifications = await notification_repo.find_by_user(user_id, page_number=0, page_size=10)
    assert [n.uuid for n in notifications] == [notification.uuid]


@pytest.mark.asyncio()
async def test_mark_all_as_read_and_count_unread(notification_repo: NotificationRepository) -> None:
    user_id = UUID("d5e4f3a2-1b0c-4d9e-8f7a-6b5c4d3e2f1a")
    await notification_repo.add([mock_notification(user_id=user_id), mock_notification(user_id=user_id)])
    assert await notification_repo.count_unread(user_id) == 2

    await notification_repo.mark_all_as_read(user_id, NOW)
    assert await notification_repo.count_unread(user_id) == 0
    notifications = await notification_repo.find_by_user(user_id, page_number=0, page_size=10)
    assert all(n.read_at == NOW for n in notifications)


@pytest.mark.asyncio()
async def test_delete_by_user(notification_repo: NotificationRepository) -> None:
    user_id = UUID("f7a6b5c4-3d2e-4f1a-8b9c-8d7e6f5a4b3c")
    other_user_notification = mock_notification()
    await notification_repo.add([mock_notification(user_id=user_id), other_user_notification])

    await notification_repo.delete_by_user(user_id)

    assert await notification_repo.find_by_user(user_id, page_number=0, page_size=10) == []
    assert len(await notification_repo.find_by_user(other_user_notification.user_id, 0, 10)) == 1
