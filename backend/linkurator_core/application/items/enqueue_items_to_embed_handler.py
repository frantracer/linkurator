import asyncio
import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from linkurator_core.domain.items.item_creation_cursor import ItemCreationCursor
from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.domain.items.item_repository import ItemRepository

DEFAULT_BATCH_SIZE = 1_000
SETTLE_DELAY = timedelta(minutes=1)
INITIAL_CURSOR = ItemCreationCursor(datetime(1970, 1, 1, tzinfo=timezone.utc), UUID(int=2**128 - 1))


class EnqueueItemsToEmbedHandler:
    """Enqueue a bounded batch of IDs created before the settle delay, resuming by creation date and UUID."""

    def __init__(
            self,
            item_repository: ItemRepository,
            item_embedding_queue_repository: ItemEmbeddingQueueRepository,
            batch_size: int = DEFAULT_BATCH_SIZE,
    ) -> None:
        if batch_size <= 0:
            msg = "batch_size must be positive"
            raise ValueError(msg)
        self.item_repository = item_repository
        self.item_embedding_queue_repository = item_embedding_queue_repository
        self.batch_size = batch_size
        self._lock = asyncio.Lock()

    async def handle(self) -> None:
        if self._lock.locked():
            logging.info("Skipping enqueue of items to embed, the previous run has not finished yet")
            return
        async with self._lock:
            cursor = await self.item_embedding_queue_repository.get_creation_cursor() or INITIAL_CURSOR
            settled_until = datetime.now(timezone.utc) - SETTLE_DELAY
            batch = await self.item_repository.find_item_creation_batch(
                after=cursor, created_until=settled_until, limit=self.batch_size,
            )
            if not batch:
                return
            # Enqueue first: a crash before saving the cursor safely repeats this bounded batch.
            await self.item_embedding_queue_repository.enqueue([item.item_uuid for item in batch])
            await self.item_embedding_queue_repository.set_creation_cursor(batch[-1])
            logging.info("Enqueued %d items to embed created until %s", len(batch), batch[-1].created_at)
