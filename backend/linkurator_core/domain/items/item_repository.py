from __future__ import annotations

import abc
from dataclasses import dataclass, field
from datetime import datetime
from uuid import UUID

from pydantic import AnyUrl

from linkurator_core.domain.common.units import Seconds
from linkurator_core.domain.items.interaction import Interaction, InteractionType
from linkurator_core.domain.items.item import Item, ItemProvider
from linkurator_core.domain.items.item_embedding import ItemEmbedding


@dataclass
class AnyItemInteraction:
    without_interactions: bool | None = None
    recommended: bool | None = None
    discouraged: bool | None = None
    viewed: bool | None = None
    hidden: bool | None = None


@dataclass
class ItemFilterCriteria:
    item_ids: set[UUID] | None = None
    subscription_ids: list[UUID] | None = None
    published_after: datetime | None = None
    updated_before: datetime | None = None
    created_before: datetime | None = None
    url: AnyUrl | None = None
    last_version: int | None = None
    provider: ItemProvider | None = None
    text: str | None = None
    interactions_from_user: UUID | None = None
    min_duration: int | None = None
    max_duration: int | None = None
    interactions: AnyItemInteraction = field(default_factory=AnyItemInteraction)


@dataclass
class InteractionFilterCriteria:
    item_ids: list[UUID] | None = None
    user_ids: list[UUID] | None = None
    interaction_types: list[InteractionType] | None = None
    created_before: datetime | None = None
    text: str | None = None
    min_duration: int | None = None
    max_duration: int | None = None


@dataclass
class SimilarItem:
    item: Item
    similarity: float


@dataclass
class SimilarItemsFilter:
    """Restrictions applied to the items before ranking them by similarity. Unset fields do not restrict."""

    min_duration: Seconds | None = None
    max_duration: Seconds | None = None
    published_after: datetime | None = None
    published_before: datetime | None = None
    providers: list[ItemProvider] = field(default_factory=list)


class ItemRepository(abc.ABC):
    def __init__(self) -> None:
        pass

    @abc.abstractmethod
    async def upsert_items(self, items: list[Item]) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def get_item(self, item_id: UUID) -> Item | None:
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_item(self, item_id: UUID) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def find_items(self, criteria: ItemFilterCriteria, page_number: int, limit: int) -> list[Item]:
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_all_items(self) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def add_interaction(self, interaction: Interaction) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def get_interaction(self, interaction_id: UUID) -> Interaction | None:
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_interaction(self, interaction_id: UUID) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_all_interactions(self) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def get_user_interactions_by_item_id(
            self, user_id: UUID, item_ids: list[UUID],
    ) -> dict[UUID, list[Interaction]]:
        raise NotImplementedError

    @abc.abstractmethod
    async def find_interactions(
            self, criteria: InteractionFilterCriteria, page_number: int, limit: int,
    ) -> list[Interaction]:
        raise NotImplementedError

    @abc.abstractmethod
    async def count_items(self, provider: ItemProvider | None = None) -> int:
        raise NotImplementedError

    @abc.abstractmethod
    async def upsert_embeddings(self, embeddings: list[ItemEmbedding]) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def get_embedding_text_hashes(self, item_ids: list[UUID]) -> dict[UUID, UUID]:
        """Hash of the text used for the embedding of each item. Items without embedding are not included."""
        raise NotImplementedError

    @abc.abstractmethod
    async def find_items_created_after(self, created_after: datetime, limit: int) -> list[Item]:
        """Non deleted items created after the date, oldest created first"""
        raise NotImplementedError

    @abc.abstractmethod
    async def find_similar_items(
            self,
            vector: list[float],
            limit: int,
            excluded_vectors: list[list[float]] | None = None,
            max_excluded_similarity: float = 1.0,
            filters: SimilarItemsFilter | None = None,
    ) -> list[SimilarItem]:
        """
        Non deleted items sorted by cosine similarity to the vector, most similar first.
        Items whose similarity to any of the excluded vectors reaches max_excluded_similarity are discarded.
        Items that do not match the filters are discarded. Duration bounds are inclusive and discard items with an
        unknown duration, published_after is inclusive and published_before is exclusive.
        """
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_all_embeddings(self) -> None:
        raise NotImplementedError
