import logging
from datetime import datetime, timezone

from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.domain.items.item_repository import ItemRepository

DEFAULT_ENQUEUE_BATCH_SIZE = 1_000
INITIAL_EMBEDDED_UNTIL = datetime(1970, 1, 1, tzinfo=timezone.utc)


class EnqueueItemsToEmbedHandler:
    """Enqueue one batch of the items created since the previous run, oldest created first"""

    def __init__(
            self,
            item_repository: ItemRepository,
            item_embedding_queue_repository: ItemEmbeddingQueueRepository,
            batch_size: int = DEFAULT_ENQUEUE_BATCH_SIZE,
    ) -> None:
        self.item_repository = item_repository
        self.item_embedding_queue_repository = item_embedding_queue_repository
        self.batch_size = batch_size

    async def handle(self) -> None:
        embedded_until = await self.item_embedding_queue_repository.get_embedded_until() or INITIAL_EMBEDDED_UNTIL
        items = await self.item_repository.find_items_created_after(
            created_after=embedded_until, limit=self.batch_size,
        )
        if len(items) == 0:
            return

        await self.item_embedding_queue_repository.enqueue([item.uuid for item in items])
        await self.item_embedding_queue_repository.set_embedded_until(items[-1].created_at)
        logging.info("Enqueued %d items to embed created until %s", len(items), items[-1].created_at)
