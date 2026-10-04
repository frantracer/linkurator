from datetime import datetime, timezone
from ipaddress import IPv4Address
from typing import Any
from uuid import uuid4

import pytest

from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.infrastructure.in_memory.item_embedding_queue_repository import (
    InMemoryItemEmbeddingQueueRepository,
)
from linkurator_core.infrastructure.postgres.item_embedding_queue_repository import (
    PostgresItemEmbeddingQueueRepository,
)


@pytest.fixture(name="queue_repo", scope="session", params=["in_memory", "postgresql"])
def fixture_queue_repo(db_name: str, request: Any) -> ItemEmbeddingQueueRepository:
    if request.param == "postgresql":
        return PostgresItemEmbeddingQueueRepository(IPv4Address("127.0.0.1"), 5432, db_name, "develop", "develop")
    return InMemoryItemEmbeddingQueueRepository()


@pytest.mark.asyncio()
async def test_dequeue_returns_oldest_enqueued_first(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    item_ids = [uuid4() for _ in range(3)]
    for item_id in item_ids:
        await queue_repo.enqueue([item_id])

    assert set(await queue_repo.dequeue(limit=2)) == {item_ids[0], item_ids[1]}
    assert await queue_repo.dequeue(limit=2) == [item_ids[2]]
    assert await queue_repo.dequeue(limit=2) == []


@pytest.mark.asyncio()
async def test_enqueue_does_not_duplicate_items(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    item_id = uuid4()

    await queue_repo.enqueue([item_id])
    await queue_repo.enqueue([item_id])

    assert await queue_repo.dequeue(limit=10) == [item_id]
    assert await queue_repo.dequeue(limit=10) == []


@pytest.mark.asyncio()
async def test_set_embedded_until_overwrites_the_previous_date(queue_repo: ItemEmbeddingQueueRepository) -> None:
    await queue_repo.delete_all()
    assert await queue_repo.get_embedded_until() is None
    first_date = datetime(2025, 1, 1, tzinfo=timezone.utc)
    second_date = datetime(2025, 6, 1, tzinfo=timezone.utc)

    await queue_repo.set_embedded_until(first_date)
    assert await queue_repo.get_embedded_until() == first_date

    await queue_repo.set_embedded_until(second_date)
    assert await queue_repo.get_embedded_until() == second_date


@pytest.mark.asyncio()
async def test_delete_all_empties_the_queue_and_the_embedded_until_date(
        queue_repo: ItemEmbeddingQueueRepository,
) -> None:
    await queue_repo.delete_all()
    await queue_repo.enqueue([uuid4()])
    await queue_repo.set_embedded_until(datetime(2025, 1, 1, tzinfo=timezone.utc))

    await queue_repo.delete_all()

    assert await queue_repo.dequeue(limit=10) == []
    assert await queue_repo.get_embedded_until() is None
