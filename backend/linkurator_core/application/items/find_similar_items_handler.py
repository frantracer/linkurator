import asyncio
import logging
from dataclasses import dataclass

from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.agents.search_query_parser_service import SearchQuery, SearchQueryParserService
from linkurator_core.domain.items.item_repository import ItemRepository, SimilarItem


async def find_items_similar_to_query(
        item_repository: ItemRepository,
        embedding_service: EmbeddingService,
        search_query: SearchQuery,
        limit: int,
        discard_unrelated: bool,
) -> list[SimilarItem]:
    positive_vector, *negative_vectors = await asyncio.gather(
        embedding_service.embed_query(search_query.positive),
        *(embedding_service.embed_query(negative) for negative in search_query.negatives),
    )
    similar_items = await item_repository.find_similar_items(
        vector=positive_vector,
        limit=limit,
        excluded_vectors=negative_vectors,
        max_excluded_similarity=embedding_service.related_similarity_threshold(),
        filters=search_query.filters,
    )
    if not discard_unrelated:
        return similar_items
    unrelated_threshold = embedding_service.unrelated_similarity_threshold()
    return [similar_item for similar_item in similar_items if similar_item.similarity >= unrelated_threshold]


@dataclass
class FindSimilarItemsResponse:
    search_query: SearchQuery
    items: list[SimilarItem]


class FindSimilarItemsHandler:
    def __init__(
            self,
            item_repository: ItemRepository,
            embedding_service: EmbeddingService,
            search_query_parser: SearchQueryParserService,
    ) -> None:
        self.item_repository = item_repository
        self.embedding_service = embedding_service
        self.search_query_parser = search_query_parser

    async def handle(self, prompt: str, limit: int) -> FindSimilarItemsResponse:
        if prompt.strip() == "" or limit <= 0:
            return FindSimilarItemsResponse(search_query=SearchQuery(positive=prompt), items=[])

        search_query = await self._parse(prompt)
        if search_query.positive == "":
            return FindSimilarItemsResponse(search_query=search_query, items=[])

        items = await find_items_similar_to_query(
            item_repository=self.item_repository,
            embedding_service=self.embedding_service,
            search_query=search_query,
            limit=limit,
            discard_unrelated=False,
        )
        return FindSimilarItemsResponse(search_query=search_query, items=items)

    async def _parse(self, prompt: str) -> SearchQuery:
        """Split the prompt, falling back to a plain search with the whole prompt if the parser fails"""
        try:
            return await self.search_query_parser.parse(prompt)
        except Exception:
            logging.exception("Failed to parse search prompt, searching with the whole prompt")
            return SearchQuery(positive=prompt)
