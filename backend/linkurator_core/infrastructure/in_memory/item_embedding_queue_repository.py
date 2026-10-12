from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from linkurator_core.domain.items.item_creation_cursor import ItemCreationCursor
from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository


class InMemoryItemEmbeddingQueueRepository(ItemEmbeddingQueueRepository):
    def __init__(self) -> None:
        self.queue: dict[UUID, datetime] = {}
        self.cursor: ItemCreationCursor | None = None

    async def enqueue(self, item_ids: list[UUID]) -> None:
        now = datetime.now(timezone.utc)
        for item_id in item_ids:
            self.queue[item_id] = now

    async def find_pending(self, limit: int, enqueued_until: datetime) -> list[UUID]:
        pending = sorted(self.queue.items(), key=lambda entry: (entry[1], entry[0]))
        return [item_id for item_id, enqueued_at in pending if enqueued_at <= enqueued_until][:limit]

    async def delete(self, item_ids: list[UUID], enqueued_until: datetime) -> None:
        for item_id in item_ids:
            if item_id in self.queue and self.queue[item_id] <= enqueued_until:
                del self.queue[item_id]

    async def get_creation_cursor(self) -> ItemCreationCursor | None:
        return self.cursor

    async def set_creation_cursor(self, cursor: ItemCreationCursor) -> None:
        self.cursor = cursor

    async def delete_all(self) -> None:
        self.queue.clear()
        self.cursor = None
