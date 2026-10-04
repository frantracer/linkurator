from unittest.mock import AsyncMock
from uuid import uuid4

import pytest

from linkurator_core.application.items.find_similar_items_handler import FindSimilarItemsHandler
from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.agents.search_query_parser_service import SearchQuery, SearchQueryParserService
from linkurator_core.domain.common.mock_factory import mock_item
from linkurator_core.domain.items.item import Item
from linkurator_core.domain.items.item_embedding import ItemEmbedding
from linkurator_core.domain.items.item_repository import SimilarItemsFilter
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository

QUERY_VECTORS = {
    "italian recipes": [1.0, 0.0, 0.0],
    "artichokes": [0.0, 0.0, 1.0],
}


def _embedding_service() -> AsyncMock:
    service = AsyncMock(spec=EmbeddingService)
    service.embed_query.side_effect = lambda query: QUERY_VECTORS[query]
    service.related_similarity_threshold.return_value = 0.4
    return service


def _parser(search_query: SearchQuery) -> AsyncMock:
    parser = AsyncMock(spec=SearchQueryParserService)
    parser.parse.return_value = search_query
    return parser


async def _repository_with_items(vectors: list[list[float]]) -> tuple[InMemoryItemRepository, list[Item]]:
    item_repository = InMemoryItemRepository()
    items = [mock_item() for _ in vectors]
    await item_repository.upsert_items(items)
    await item_repository.upsert_embeddings([
        ItemEmbedding.new(item_uuid=item.uuid, vector=vector, text_hash=uuid4())
        for item, vector in zip(items, vectors, strict=True)
    ])
    return item_repository, items


@pytest.mark.asyncio()
async def test_returns_items_sorted_by_similarity() -> None:
    item_repository, (close_item, middle_item, _far_item) = await _repository_with_items([
        [1.0, 0.0, 0.0], [1.0, 1.0, 0.0], [0.0, 1.0, 0.0],
    ])
    parser = _parser(SearchQuery(positive="italian recipes"))

    handler = FindSimilarItemsHandler(
        item_repository=item_repository, embedding_service=_embedding_service(),
        search_query_parser=parser,
    )
    response = await handler.handle(prompt="italian recipes", limit=2)

    parser.parse.assert_called_once_with("italian recipes")
    assert [similar_item.item.uuid for similar_item in response.items] == [close_item.uuid, middle_item.uuid]
    assert response.items[0].similarity > response.items[1].similarity


@pytest.mark.asyncio()
async def test_excludes_items_similar_to_negative_concepts() -> None:
    item_repository, (plain_item, artichoke_item, slightly_related_item) = await _repository_with_items([
        [1.0, 0.0, 0.0], [1.0, 0.0, 1.0], [1.0, 0.0, 0.2],
    ])
    search_query = SearchQuery(positive="italian recipes", negatives=["artichokes"])
    embedding_service = _embedding_service()

    handler = FindSimilarItemsHandler(
        item_repository=item_repository, embedding_service=embedding_service,
        search_query_parser=_parser(search_query),
    )
    response = await handler.handle(prompt="italian recipes without artichokes", limit=10)

    assert response.search_query == search_query
    assert [similar_item.item.uuid for similar_item in response.items] == [plain_item.uuid, slightly_related_item.uuid]
    assert artichoke_item.uuid not in {similar_item.item.uuid for similar_item in response.items}
    assert [call.args[0] for call in embedding_service.embed_query.call_args_list] == ["italian recipes", "artichokes"]


@pytest.mark.asyncio()
async def test_only_returns_items_matching_the_filters() -> None:
    item_repository = InMemoryItemRepository()
    long_item = mock_item(duration=45 * 60)
    short_item = mock_item(duration=10 * 60)
    await item_repository.upsert_items([long_item, short_item])
    await item_repository.upsert_embeddings([
        ItemEmbedding.new(item_uuid=long_item.uuid, vector=[1.0, 1.0, 0.0], text_hash=uuid4()),
        ItemEmbedding.new(item_uuid=short_item.uuid, vector=[1.0, 0.0, 0.0], text_hash=uuid4()),
    ])
    search_query = SearchQuery(positive="italian recipes", filters=SimilarItemsFilter(min_duration=30 * 60))

    handler = FindSimilarItemsHandler(
        item_repository=item_repository, embedding_service=_embedding_service(),
        search_query_parser=_parser(search_query),
    )
    response = await handler.handle(prompt="italian recipes longer than 30 minutes", limit=10)

    assert response.search_query == search_query
    assert [similar_item.item.uuid for similar_item in response.items] == [long_item.uuid]


@pytest.mark.asyncio()
async def test_searches_with_the_whole_prompt_when_the_parser_fails() -> None:
    item_repository, (item,) = await _repository_with_items([[1.0, 0.0, 0.0]])
    parser = AsyncMock(spec=SearchQueryParserService)
    parser.parse.side_effect = RuntimeError("LLM unavailable")

    handler = FindSimilarItemsHandler(
        item_repository=item_repository, embedding_service=_embedding_service(),
        search_query_parser=parser,
    )
    response = await handler.handle(prompt="italian recipes", limit=10)

    assert response.search_query == SearchQuery(positive="italian recipes")
    assert [similar_item.item.uuid for similar_item in response.items] == [item.uuid]


@pytest.mark.asyncio()
async def test_returns_nothing_when_the_prompt_only_has_exclusions() -> None:
    item_repository, _ = await _repository_with_items([[1.0, 0.0, 0.0]])
    embedding_service = _embedding_service()

    handler = FindSimilarItemsHandler(
        item_repository=item_repository, embedding_service=embedding_service,
        search_query_parser=_parser(SearchQuery(positive="", negatives=["artichokes"])),
    )
    response = await handler.handle(prompt="nothing with artichokes", limit=10)

    assert response.items == []
    embedding_service.embed_query.assert_not_called()


@pytest.mark.asyncio()
@pytest.mark.parametrize(("prompt", "limit"), [("   ", 10), ("some prompt", 0)])
async def test_returns_nothing_for_blank_prompt_or_non_positive_limit(prompt: str, limit: int) -> None:
    item_repository, _ = await _repository_with_items([])
    embedding_service = _embedding_service()
    parser = AsyncMock(spec=SearchQueryParserService)

    handler = FindSimilarItemsHandler(
        item_repository=item_repository, embedding_service=embedding_service,
        search_query_parser=parser,
    )
    response = await handler.handle(prompt=prompt, limit=limit)

    assert response.items == []
    parser.parse.assert_not_called()
    embedding_service.embed_query.assert_not_called()
