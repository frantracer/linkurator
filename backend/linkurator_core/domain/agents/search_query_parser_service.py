from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from linkurator_core.domain.items.item_repository import SimilarItemsFilter


@dataclass
class SearchQuery:
    """
    A search prompt split into what the user wants, what the user wants to exclude and the restrictions on
    the items metadata (duration, publish date, provider)
    """

    positive: str
    negatives: list[str] = field(default_factory=list)
    filters: SimilarItemsFilter = field(default_factory=SimilarItemsFilter)


class SearchQueryParserService(ABC):
    @abstractmethod
    async def parse(self, prompt: str) -> SearchQuery:
        pass
