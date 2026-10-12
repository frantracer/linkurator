from datetime import datetime, timedelta, timezone
from ipaddress import IPv4Address
from typing import Any
from uuid import uuid4

import pytest

from linkurator_core.domain.items.item_creation_cursor import ItemCreationCursor
from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.infrastructure.in_memory.item_embedding_queue_repository import (
    InMemoryItemEmbeddingQueueRepository,
)
from linkurator_core.infrastructure.postgres.item_embedding_queue_repository import PostgresItemEmbeddingQueueRepository


@pytest.fixture(name="queue_repo", scope="session", params=["in_memory", "postgresql"])
def fixture_queue_repo(db_name: str, request: Any) -> ItemEmbeddingQueueRepository:
    if request.param == "postgresql":
        return PostgresItemEmbeddingQueueRepository(IPv4Address("127.0.0.1"), 5432, db_name, "develop", "develop")
    return InMemoryItemEmbeddingQueueRepository()


@pytest.mark.asyncio()
async def test_pending_batch_remains_until_deleted(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    item_ids = [uuid4() for _ in range(3)]
    for item_id in item_ids:
        await queue_repo.enqueue([item_id])
    batch_started = datetime.now(timezone.utc)
    assert await queue_repo.find_pending(limit=2, enqueued_until=batch_started) == item_ids[:2]
    assert await queue_repo.find_pending(limit=2, enqueued_until=batch_started) == item_ids[:2]
    await queue_repo.delete(item_ids[:2], enqueued_until=batch_started)
    assert await queue_repo.find_pending(limit=2, enqueued_until=batch_started) == item_ids[2:]


@pytest.mark.asyncio()
async def test_enqueue_does_not_duplicate_items(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    item_id = uuid4()
    await queue_repo.enqueue([item_id, item_id])
    await queue_repo.enqueue([item_id])
    assert await queue_repo.find_pending(limit=10, enqueued_until=datetime.now(timezone.utc)) == [item_id]


@pytest.mark.asyncio()
async def test_set_creation_cursor_overwrites_previous_cursor(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    assert await queue_repo.get_creation_cursor() is None
    first = ItemCreationCursor(datetime(2025, 1, 1, tzinfo=timezone.utc), uuid4())
    second = ItemCreationCursor(first.created_at, uuid4())
    await queue_repo.set_creation_cursor(first)
    assert await queue_repo.get_creation_cursor() == first
    await queue_repo.set_creation_cursor(second)
    assert await queue_repo.get_creation_cursor() == second


@pytest.mark.asyncio()
async def test_delete_all_empties_queue_and_cursor(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    await queue_repo.enqueue([uuid4()])
    await queue_repo.set_creation_cursor(ItemCreationCursor(datetime.now(timezone.utc), uuid4()))
    await queue_repo.delete_all()
    assert await queue_repo.find_pending(limit=10, enqueued_until=datetime.now(timezone.utc)) == []
    assert await queue_repo.get_creation_cursor() is None


@pytest.mark.asyncio()
async def test_refresh_during_processing_remains_pending(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    item_id = uuid4()
    await queue_repo.enqueue([item_id])
    batch_started = datetime.now(timezone.utc)
    assert await queue_repo.find_pending(limit=1, enqueued_until=batch_started) == [item_id]
    await queue_repo.enqueue([item_id])
    await queue_repo.delete([item_id], enqueued_until=batch_started)
    assert await queue_repo.find_pending(limit=1, enqueued_until=datetime.now(timezone.utc)) == [item_id]
    assert await queue_repo.find_pending(limit=1, enqueued_until=batch_started) == []


@pytest.mark.asyncio()
async def test_batch_does_not_include_newly_enqueued_items(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=1)
    await queue_repo.enqueue([uuid4()])
    assert await queue_repo.find_pending(limit=1, enqueued_until=cutoff) == []
