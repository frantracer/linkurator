from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock
from uuid import UUID, uuid4

import pytest

from linkurator_core.application.items.embed_items_handler import EmbedItemsHandler
from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.domain.items.item import Item
from linkurator_core.domain.items.item_embedding import ItemEmbedding, item_embedding_text, item_embedding_text_hash
from linkurator_core.infrastructure.in_memory.item_embedding_queue_repository import (
    InMemoryItemEmbeddingQueueRepository,
)
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository


def _embedding_service() -> AsyncMock:
    service = AsyncMock(spec=EmbeddingService)
    service.embed_documents.side_effect = lambda documents: [[float(i), 1.0] for i in range(len(documents))]
    return service


def _text_hash(item: Item) -> UUID:
    return item_embedding_text_hash(item_embedding_text(item))


async def _repositories_with_queued_items(
        items: list[Item],
) -> tuple[InMemoryItemRepository, InMemoryItemEmbeddingQueueRepository]:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    await item_repository.upsert_items(items)
    await queue_repository.enqueue([item.uuid for item in items])
    return item_repository, queue_repository


@pytest.mark.asyncio()
async def test_embeds_queued_items_and_stores_the_hash_of_their_text() -> None:
    item = mock_item()
    item_repository, queue_repository = await _repositories_with_queued_items([item])
    embedding_service = _embedding_service()

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=embedding_service,
    )
    await handler.handle()

    embedding_service.embed_documents.assert_called_once_with([item_embedding_text(item)])
    assert item_repository.embeddings[item.uuid].vector == [0.0, 1.0]
    assert item_repository.embeddings[item.uuid].text_hash == _text_hash(item)
    assert queue_repository.queue == []


@pytest.mark.asyncio()
async def test_skips_items_whose_text_did_not_change() -> None:
    unchanged_item = mock_item()
    changed_item = mock_item()
    item_repository, queue_repository = await _repositories_with_queued_items([unchanged_item, changed_item])
    await item_repository.upsert_embeddings([
        ItemEmbedding.new(item_uuid=unchanged_item.uuid, vector=[1.0, 0.0], text_hash=_text_hash(unchanged_item)),
        ItemEmbedding.new(item_uuid=changed_item.uuid, vector=[1.0, 0.0], text_hash=uuid4()),
    ])
    embedding_service = _embedding_service()

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=embedding_service,
    )
    await handler.handle()

    embedding_service.embed_documents.assert_called_once_with([item_embedding_text(changed_item)])
    assert item_repository.embeddings[unchanged_item.uuid].vector == [1.0, 0.0]
    assert item_repository.embeddings[changed_item.uuid].text_hash == _text_hash(changed_item)


@pytest.mark.asyncio()
async def test_embeds_one_batch_per_run() -> None:
    items = [mock_item() for _ in range(5)]
    item_repository, queue_repository = await _repositories_with_queued_items(items)

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=_embedding_service(), batch_size=2,
    )
    await handler.handle()
    assert set(item_repository.embeddings) == {items[0].uuid, items[1].uuid}

    await handler.handle()
    assert set(item_repository.embeddings) == {item.uuid for item in items[:4]}


@pytest.mark.asyncio()
async def test_items_that_failed_to_embed_are_not_stored() -> None:
    now = datetime.now(tz=timezone.utc)
    # Most recently published first, the order in which the items are loaded
    items = [mock_item(published_at=now - timedelta(days=days)) for days in range(3)]
    item_repository, queue_repository = await _repositories_with_queued_items(items)
    embedding_service = _embedding_service()
    embedding_service.embed_documents.side_effect = None
    embedding_service.embed_documents.return_value = [None, [1.0, 0.0], [0.0, 1.0]]

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=embedding_service,
    )
    await handler.handle()

    assert set(item_repository.embeddings) == {items[1].uuid, items[2].uuid}
    assert queue_repository.queue == []


@pytest.mark.asyncio()
async def test_items_are_enqueued_again_when_the_embedding_service_fails() -> None:
    items = [mock_item() for _ in range(2)]
    item_repository, queue_repository = await _repositories_with_queued_items(items)
    embedding_service = _embedding_service()
    embedding_service.embed_documents.side_effect = RuntimeError("Embedding service unavailable")

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=embedding_service,
    )
    await handler.handle()

    assert item_repository.embeddings == {}
    assert set(queue_repository.queue) == {item.uuid for item in items}


@pytest.mark.asyncio()
async def test_skips_deleted_items() -> None:
    deleted_item = mock_item()
    deleted_item.deleted_at = datetime.now(tz=timezone.utc)
    item_repository, queue_repository = await _repositories_with_queued_items([deleted_item])
    embedding_service = _embedding_service()

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=embedding_service,
    )
    await handler.handle()

    embedding_service.embed_documents.assert_not_called()
    assert item_repository.embeddings == {}


@pytest.mark.asyncio()
async def test_does_nothing_when_the_queue_is_empty() -> None:
    item_repository = InMemoryItemRepository()
    queue_repository = InMemoryItemEmbeddingQueueRepository()
    embedding_service = _embedding_service()

    handler = EmbedItemsHandler(
        item_repository=item_repository, item_embedding_queue_repository=queue_repository,
        embedding_service=embedding_service,
    )
    await handler.handle()

    embedding_service.embed_documents.assert_not_called()
