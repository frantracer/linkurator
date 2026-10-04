from datetime import datetime, timedelta, timezone

import pytest

from linkurator_core.application.items.enqueue_items_to_embed_handler import EnqueueItemsToEmbedHandler
from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.infrastructure.in_memory.item_embedding_queue_repository import (
    InMemoryItemEmbeddingQueueRepository,
)
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository


@pytest.mark.asyncio()
async def test_enqueues_one_batch_of_the_oldest_created_items_per_run() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    now = datetime.now(tz=timezone.utc)
    items = [mock_item(created_at=now - timedelta(days=days)) for days in range(5, 0, -1)]
    await item_repository.upsert_items(items)
    handler = EnqueueItemsToEmbedHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository, batch_size=2,
    )

    await handler.handle()
    assert queue_repository.queue == [items[0].uuid, items[1].uuid]
    assert queue_repository.embedded_until == items[1].created_at

    await handler.handle()
    assert queue_repository.queue == [item.uuid for item in items[:4]]
    assert queue_repository.embedded_until == items[3].created_at


@pytest.mark.asyncio()
async def test_only_enqueues_items_created_after_the_previous_run() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    now = datetime.now(tz=timezone.utc)
    old_item = mock_item(created_at=now - timedelta(days=1))
    await item_repository.upsert_items([old_item])
    handler = EnqueueItemsToEmbedHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
    )
    await handler.handle()
    await queue_repository.dequeue(limit=10)

    await handler.handle()
    assert queue_repository.queue == []

    new_item = mock_item(created_at=now)
    await item_repository.upsert_items([new_item])
    await handler.handle()

    assert queue_repository.queue == [new_item.uuid]


@pytest.mark.asyncio()
async def test_continues_from_the_stored_embedded_until_date() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    now = datetime.now(tz=timezone.utc)
    old_item = mock_item(created_at=now - timedelta(days=2))
    new_item = mock_item(created_at=now)
    await item_repository.upsert_items([old_item, new_item])
    await queue_repository.set_embedded_until(now - timedelta(days=1))

    handler = EnqueueItemsToEmbedHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
    )
    await handler.handle()

    assert queue_repository.queue == [new_item.uuid]
    assert queue_repository.embedded_until == new_item.created_at
