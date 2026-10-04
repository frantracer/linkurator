import logging

from linkurator_core.domain.agents.embedding_service import EmbeddingService
from linkurator_core.domain.items.item import Item
from linkurator_core.domain.items.item_embedding import ItemEmbedding, item_embedding_text, item_embedding_text_hash
from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.domain.items.item_repository import ItemFilterCriteria, ItemRepository

DEFAULT_EMBEDDING_BATCH_SIZE = 1_000


class EmbedItemsHandler:
    """Process one batch of the queue of items to embed, skipping the items whose text did not change"""

    def __init__(
            self,
            item_repository: ItemRepository,
            item_embedding_queue_repository: ItemEmbeddingQueueRepository,
            embedding_service: EmbeddingService,
            batch_size: int = DEFAULT_EMBEDDING_BATCH_SIZE,
    ) -> None:
        self.item_repository = item_repository
        self.item_embedding_queue_repository = item_embedding_queue_repository
        self.embedding_service = embedding_service
        self.batch_size = batch_size

    async def handle(self) -> None:
        item_ids = await self.item_embedding_queue_repository.dequeue(limit=self.batch_size)
        if len(item_ids) == 0:
            return

        items = await self.item_repository.find_items(
            criteria=ItemFilterCriteria(item_ids=set(item_ids)), page_number=0, limit=len(item_ids),
        )

        pending_items = await self._items_with_changed_text(items)
        skipped = len(items) - len(pending_items)
        if skipped > 0:
            logging.info("Skipped %d items whose embedding is up to date", skipped)
        if len(pending_items) > 0:
            await self._embed(pending_items)

    async def _items_with_changed_text(self, items: list[Item]) -> list[Item]:
        stored_hashes = await self.item_repository.get_embedding_text_hashes([item.uuid for item in items])
        return [
            item for item in items
            if stored_hashes.get(item.uuid) != item_embedding_text_hash(item_embedding_text(item))
        ]

    async def _embed(self, items: list[Item]) -> None:
        texts = [item_embedding_text(item) for item in items]
        try:
            vectors = await self.embedding_service.embed_documents(texts)
        except Exception:
            logging.exception("Failed to embed %d items, they are enqueued again", len(items))
            await self.item_embedding_queue_repository.enqueue([item.uuid for item in items])
            return

        embeddings = [
            ItemEmbedding.new(item_uuid=item.uuid, vector=vector, text_hash=item_embedding_text_hash(text))
            for item, text, vector in zip(items, texts, vectors, strict=True)
            if vector is not None
        ]
        if len(embeddings) > 0:
            await self.item_repository.upsert_embeddings(embeddings)
        logging.info("Embedded %d of %d items", len(embeddings), len(items))
