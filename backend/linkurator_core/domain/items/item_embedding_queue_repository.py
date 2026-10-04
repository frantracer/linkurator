from __future__ import annotations

import abc
from datetime import datetime
from uuid import UUID


class ItemEmbeddingQueueRepository(abc.ABC):
    """Queue of items whose embedding must be computed, and how far the search of new items went"""

    @abc.abstractmethod
    async def enqueue(self, item_ids: list[UUID]) -> None:
        """Items already in the queue are not duplicated"""
        raise NotImplementedError

    @abc.abstractmethod
    async def dequeue(self, limit: int) -> list[UUID]:
        """Remove up to limit items from the queue, oldest enqueued first"""
        raise NotImplementedError

    @abc.abstractmethod
    async def get_embedded_until(self) -> datetime | None:
        """Creation date of the last item enqueued by the search of new items"""
        raise NotImplementedError

    @abc.abstractmethod
    async def set_embedded_until(self, embedded_until: datetime) -> None:
        raise NotImplementedError

    @abc.abstractmethod
    async def delete_all(self) -> None:
        """Empty the queue and forget the embedded until date"""
        raise NotImplementedError
