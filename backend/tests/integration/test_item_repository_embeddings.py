from datetime import datetime, timedelta, timezone
from ipaddress import IPv4Address
from typing import Any
from uuid import uuid4

import pytest

from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.domain.items.item_embedding import ItemEmbedding
from linkurator_core.domain.items.item_repository import ItemRepository, SimilarItemsFilter
from linkurator_core.infrastructure.ai_agents.embeddings import EMBEDDING_DIMENSIONS
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository
from linkurator_core.infrastructure.postgres.item_repository import PostgresItemRepository


def _vector(*values: float) -> list[float]:
    return list(values) + [0.0] * (EMBEDDING_DIMENSIONS - len(values))


@pytest.fixture(name="item_repo", scope="session", params=["in_memory", "postgresql"])
def fixture_item_repo(db_name: str, request: Any) -> ItemRepository:
    if request.param == "postgresql":
        return PostgresItemRepository(IPv4Address("127.0.0.1"), 5432, db_name, "develop", "develop")
    return InMemoryItemRepository()


async def _clean(item_repo: ItemRepository) -> None:
    await item_repo.delete_all_items()
    await item_repo.delete_all_embeddings()


@pytest.mark.asyncio()
async def test_find_items_created_after_returns_oldest_created_non_deleted_items(item_repo: ItemRepository) -> None:
    await _clean(item_repo)
    now = datetime.now(tz=timezone.utc)
    too_old_item = mock_item(created_at=now - timedelta(days=4))
    old_item = mock_item(created_at=now - timedelta(days=3))
    middle_item = mock_item(created_at=now - timedelta(days=2))
    recent_item = mock_item(created_at=now - timedelta(days=1))
    deleted_item = mock_item(created_at=now - timedelta(days=2))
    await item_repo.upsert_items([recent_item, old_item, too_old_item, middle_item, deleted_item])
    await item_repo.delete_item(deleted_item.uuid)

    items = await item_repo.find_items_created_after(created_after=too_old_item.created_at, limit=2)

    assert [item.uuid for item in items] == [old_item.uuid, middle_item.uuid]


@pytest.mark.asyncio()
async def test_get_embedding_text_hashes(item_repo: ItemRepository) -> None:
    await _clean(item_repo)
    embedded_item = mock_item()
    pending_item = mock_item()
    await item_repo.upsert_items([embedded_item, pending_item])
    text_hash = uuid4()
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=embedded_item.uuid, vector=_vector(1.0), text_hash=text_hash),
    ])

    hashes = await item_repo.get_embedding_text_hashes([embedded_item.uuid, pending_item.uuid])

    assert hashes == {embedded_item.uuid: text_hash}


@pytest.mark.asyncio()
async def test_find_similar_items(item_repo: ItemRepository) -> None:
    await _clean(item_repo)
    close_item = mock_item()
    middle_item = mock_item()
    far_item = mock_item()
    deleted_item = mock_item()
    await item_repo.upsert_items([close_item, middle_item, far_item, deleted_item])
    await item_repo.delete_item(deleted_item.uuid)
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=close_item.uuid, vector=_vector(1.0, 0.0), text_hash=uuid4()),
        ItemEmbedding.new(item_uuid=middle_item.uuid, vector=_vector(1.0, 1.0), text_hash=uuid4()),
        ItemEmbedding.new(item_uuid=far_item.uuid, vector=_vector(0.0, 1.0), text_hash=uuid4()),
        ItemEmbedding.new(item_uuid=deleted_item.uuid, vector=_vector(1.0, 0.0), text_hash=uuid4()),
    ])

    similar_items = await item_repo.find_similar_items(vector=_vector(1.0, 0.0), limit=10)

    assert [similar_item.item.uuid for similar_item in similar_items] == [
        close_item.uuid, middle_item.uuid, far_item.uuid,
    ]
    assert similar_items[0].item == close_item
    assert similar_items[0].similarity == pytest.approx(1.0)
    assert similar_items[1].similarity == pytest.approx(0.7071, abs=1e-3)
    assert similar_items[2].similarity == pytest.approx(0.0)

    similar_items = await item_repo.find_similar_items(vector=_vector(1.0, 0.0), limit=1)
    assert [similar_item.item.uuid for similar_item in similar_items] == [close_item.uuid]


@pytest.mark.asyncio()
async def test_upsert_overwrites_existing_embedding(item_repo: ItemRepository) -> None:
    await _clean(item_repo)
    item = mock_item()
    await item_repo.upsert_items([item])
    second_hash = uuid4()
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=item.uuid, vector=_vector(0.0, 1.0), text_hash=uuid4()),
    ])
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=item.uuid, vector=_vector(1.0, 0.0), text_hash=second_hash),
    ])

    similar_items = await item_repo.find_similar_items(vector=_vector(1.0, 0.0), limit=10)

    assert len(similar_items) == 1
    assert similar_items[0].similarity == pytest.approx(1.0)
    assert await item_repo.get_embedding_text_hashes([item.uuid]) == {item.uuid: second_hash}


@pytest.mark.asyncio()
async def test_find_similar_items_discards_items_similar_to_excluded_vectors(item_repo: ItemRepository) -> None:
    await _clean(item_repo)
    plain_item = mock_item()
    excluded_item = mock_item()
    await item_repo.upsert_items([plain_item, excluded_item])
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=plain_item.uuid, vector=_vector(1.0, 0.0, 0.0), text_hash=uuid4()),
        ItemEmbedding.new(item_uuid=excluded_item.uuid, vector=_vector(1.0, 0.0, 1.0), text_hash=uuid4()),
    ])

    similar_items = await item_repo.find_similar_items(
        vector=_vector(1.0, 0.0, 0.0), limit=10,
        excluded_vectors=[_vector(0.0, 1.0, 0.0), _vector(0.0, 0.0, 1.0)], max_excluded_similarity=0.5,
    )

    assert [similar_item.item.uuid for similar_item in similar_items] == [plain_item.uuid]


@pytest.mark.asyncio()
async def test_find_similar_items_returns_more_items_than_the_default_hnsw_candidate_list(
        item_repo: ItemRepository,
) -> None:
    await _clean(item_repo)
    items = [mock_item() for _ in range(60)]
    await item_repo.upsert_items(items)
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=item.uuid, vector=_vector(1.0, index / 60), text_hash=uuid4())
        for index, item in enumerate(items)
    ])

    similar_items = await item_repo.find_similar_items(vector=_vector(1.0, 0.0), limit=50)

    assert [similar_item.item.uuid for similar_item in similar_items] == [item.uuid for item in items[:50]]


@pytest.mark.asyncio()
@pytest.mark.parametrize(("filters", "expected_names"), [
    (SimilarItemsFilter(), ["long", "short", "unknown duration", "old spotify"]),
    (SimilarItemsFilter(min_duration=30 * 60), ["long", "old spotify"]),
    (SimilarItemsFilter(max_duration=30 * 60), ["short", "old spotify"]),
    (SimilarItemsFilter(min_duration=20 * 60, max_duration=40 * 60), ["old spotify"]),
    (SimilarItemsFilter(published_after=datetime(2025, 1, 1, tzinfo=timezone.utc)),
     ["long", "short", "unknown duration"]),
    (SimilarItemsFilter(published_before=datetime(2025, 1, 1, tzinfo=timezone.utc)), ["old spotify"]),
    (SimilarItemsFilter(providers=["spotify", "patreon"]), ["old spotify"]),
    (SimilarItemsFilter(providers=["youtube"], min_duration=30 * 60), ["long"]),
])
async def test_find_similar_items_only_returns_items_matching_the_filters(
        item_repo: ItemRepository, filters: SimilarItemsFilter, expected_names: list[str],
) -> None:
    await _clean(item_repo)
    recent = datetime(2025, 6, 1, tzinfo=timezone.utc)
    items = [
        mock_item(name="long", duration=60 * 60, published_at=recent),
        mock_item(name="short", duration=5 * 60, published_at=recent),
        mock_item(name="unknown duration", duration=None, published_at=recent),
        mock_item(name="old spotify", duration=30 * 60, published_at=datetime(2024, 12, 31, 23, tzinfo=timezone.utc),
                  provider="spotify"),
    ]
    await item_repo.upsert_items(items)
    await item_repo.upsert_embeddings([
        ItemEmbedding.new(item_uuid=item.uuid, vector=_vector(1.0, index / 10), text_hash=uuid4())
        for index, item in enumerate(items)
    ])

    similar_items = await item_repo.find_similar_items(vector=_vector(1.0, 0.0), limit=10, filters=filters)

    assert [similar_item.item.name for similar_item in similar_items] == expected_names
