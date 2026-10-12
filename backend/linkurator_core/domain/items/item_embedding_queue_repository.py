from __future__ import annotations

import abc
from datetime import datetime
from uuid import UUID

from linkurator_core.domain.items.item_creation_cursor import ItemCreationCursor


class ItemEmbeddingQueueRepository(abc.ABC):
    """Persistent pending items for a single embedding processor, plus the backfill cursor."""

    @abc.abstractmethod
    async def enqueue(self, item_ids: list[UUID]) -> None:
        """Add or refresh pending items without duplicating them."""
        raise NotImplementedError

    @abc.abstractmethod
    async def find_pending(self, limit: int, enqueued_until: datetime) -> list[UUID]:
        """Read a bounded batch without removing it, oldest enqueued first."""
        raise NotImplementedError

    @abc.abstractmethod
    async def delete(self, item_ids: list[UUID], enqueued_until: datetime) -> None:
        """Remove completed items unless they were enqueued again after the batch started."""
        raise NotImplementedError

    @abc.abstractmethod
    async def get_creation_cursor(self) -> ItemCreationCursor | None:
        raise NotImplementedError

    @abc.abstractmethod
    async def set_creation_cursor(self, cursor: ItemCreationCursor) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_all(self) -> None:
        """Empty the queue and forget the backfill cursor."""
        raise NotImplementedError
