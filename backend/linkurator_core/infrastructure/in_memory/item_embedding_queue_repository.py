from __future__ import annotations

from datetime import datetime
from uuid import UUID

from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository


class InMemoryItemEmbeddingQueueRepository(ItemEmbeddingQueueRepository):
    def __init__(self) -> None:
        self.queue: list[UUID] = []
        self.embedded_until: datetime | None = None

    async def enqueue(self, item_ids: list[UUID]) -> None:
        for item_id in item_ids:
            if item_id not in self.queue:
                self.queue.append(item_id)

    async def dequeue(self, limit: int) -> list[UUID]:
        taken = self.queue[:limit]
        self.queue = self.queue[limit:]
        return taken

    async def get_embedded_until(self) -> datetime | None:
        return self.embedded_until

    async def set_embedded_until(self, embedded_until: datetime) -> None:
        self.embedded_until = embedded_until

    async def delete_all(self) -> None:
        self.queue.clear()
        self.embedded_until = None
