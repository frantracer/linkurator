import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import patch
from uuid import UUID

import pytest

from linkurator_core.application.items.enqueue_items_to_embed_handler import SETTLE_DELAY, EnqueueItemsToEmbedHandler
from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.domain.items.item_creation_cursor import ItemCreationCursor
from linkurator_core.infrastructure.in_memory.item_embedding_queue_repository import (
    InMemoryItemEmbeddingQueueRepository,
)
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository

BASE_HOUR = datetime(2026, 1, 1, tzinfo=timezone.utc)


@pytest.mark.asyncio()
async def test_batches_are_bounded_and_resume_across_identical_timestamps() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    items = [mock_item(created_at=BASE_HOUR + timedelta(minutes=5)) for _ in range(5)]
    await item_repository.upsert_items(items)
    handler = EnqueueItemsToEmbedHandler(item_repository, queue_repository, batch_size=2)
    ordered_items = sorted(items, key=lambda item: item.uuid)

    for end in [2, 4, 5]:
        await handler.handle()
        assert list(queue_repository.queue) == [item.uuid for item in ordered_items[:end]]
        assert await queue_repository.get_creation_cursor() == ItemCreationCursor(
            ordered_items[end - 1].created_at, ordered_items[end - 1].uuid,
        )
    await handler.handle()
    assert len(queue_repository.queue) == 5


@pytest.mark.asyncio()
async def test_does_not_enqueue_recent_or_deleted_items() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    past_item = mock_item(created_at=BASE_HOUR)
    deleted_item = mock_item(created_at=BASE_HOUR)
    deleted_item.deleted_at = BASE_HOUR
    now = datetime.now(tz=timezone.utc)
    settled_item = mock_item(created_at=now - SETTLE_DELAY - timedelta(seconds=30))
    recent_item = mock_item(created_at=now - SETTLE_DELAY + timedelta(seconds=30))
    await item_repository.upsert_items([past_item, deleted_item, settled_item, recent_item])
    handler = EnqueueItemsToEmbedHandler(item_repository, queue_repository)
    await handler.handle()
    await handler.handle()
    assert list(queue_repository.queue) == [past_item.uuid, settled_item.uuid]


@pytest.mark.asyncio()
async def test_resumes_from_creation_cursor() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    old_item = mock_item(created_at=BASE_HOUR)
    new_item = mock_item(created_at=BASE_HOUR + timedelta(minutes=30))
    await item_repository.upsert_items([old_item, new_item])
    await queue_repository.set_creation_cursor(ItemCreationCursor(BASE_HOUR, UUID(int=2**128 - 1)))
    await EnqueueItemsToEmbedHandler(item_repository, queue_repository).handle()
    assert list(queue_repository.queue) == [new_item.uuid]


@pytest.mark.asyncio()
async def test_does_nothing_when_there_are_no_items() -> None:
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    await EnqueueItemsToEmbedHandler(InMemoryItemRepository(), queue_repository).handle()
    assert list(queue_repository.queue) == []
    assert await queue_repository.get_creation_cursor() is None


@pytest.mark.asyncio()
async def test_enqueue_failure_does_not_advance_cursor() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    await item_repository.upsert_items([mock_item(created_at=BASE_HOUR)])
    with patch.object(queue_repository, "enqueue", side_effect=RuntimeError("Database unavailable")), \
            pytest.raises(RuntimeError, match="Database unavailable"):
        await EnqueueItemsToEmbedHandler(item_repository, queue_repository).handle()
    assert await queue_repository.get_creation_cursor() is None


@pytest.mark.asyncio()
async def test_skips_overlapping_run() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    started = asyncio.Event()
    release = asyncio.Event()

    async def blocked_batch(
            after: ItemCreationCursor, created_until: datetime, limit: int,
    ) -> list[ItemCreationCursor]:
        started.set()
        await release.wait()
        return []

    handler = EnqueueItemsToEmbedHandler(item_repository, queue_repository)
    with patch.object(item_repository, "find_item_creation_batch", side_effect=blocked_batch) as find:
        first = asyncio.create_task(handler.handle())
        await started.wait()
        await handler.handle()
        assert find.call_count == 1
        release.set()
        await first


def test_rejects_non_positive_batch_size() -> None:
    with pytest.raises(ValueError, match="batch_size must be positive"):
        EnqueueItemsToEmbedHandler(InMemoryItemRepository(), InMemoryItemEmbeddingQueueRepository(), batch_size=0)
