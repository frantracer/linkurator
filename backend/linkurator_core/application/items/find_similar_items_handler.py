import asyncio
import logging
from dataclasses import dataclass

from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.agents.search_query_parser_service import SearchQuery, SearchQueryParserService
from linkurator_core.domain.items.item_repository import ItemRepository, SimilarItem


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

        positive_vector, *negative_vectors = await asyncio.gather(
            self.embedding_service.embed_query(search_query.positive),
            *(self.embedding_service.embed_query(negative) for negative in search_query.negatives),
        )
        items = await self.item_repository.find_similar_items(
            vector=positive_vector,
            limit=limit,
            excluded_vectors=negative_vectors,
            # Items about any excluded concept are discarded
            max_excluded_similarity=self.embedding_service.related_similarity_threshold(),
            filters=search_query.filters,
        )
        return FindSimilarItemsResponse(search_query=search_query, items=items)

    async def _parse(self, prompt: str) -> SearchQuery:
        """Split the prompt, falling back to a plain search with the whole prompt if the parser fails"""
        try:
            return await self.search_query_parser.parse(prompt)
        except Exception:
            logging.exception("Failed to parse search prompt, searching with the whole prompt")
            return SearchQuery(positive=prompt)
