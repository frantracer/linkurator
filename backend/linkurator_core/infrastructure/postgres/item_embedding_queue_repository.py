from __future__ import annotations

from datetime import datetime, timezone
from ipaddress import IPv4Address
from uuid import UUID

from linkurator_core.domain.items.item_creation_cursor import ItemCreationCursor
from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.infrastructure.postgres.common import PostgresConnector


class PostgresItemEmbeddingQueueRepository(ItemEmbeddingQueueRepository):
    def __init__(self, ip: IPv4Address, port: int, db_name: str, username: str, password: str) -> None:
        self._connector = PostgresConnector(ip, port, db_name, username, password)

    async def enqueue(self, item_ids: list[UUID]) -> None:
        if not item_ids:
            return
        pool = await self._connector.pool()
        await pool.execute(
            "INSERT INTO item_embedding_queue (item_uuid, enqueued_at) "
            "SELECT DISTINCT unnest(%s::uuid[]), %s ON CONFLICT (item_uuid) DO UPDATE SET "
            "enqueued_at = EXCLUDED.enqueued_at",
            item_ids, datetime.now(timezone.utc),
        )

    async def find_pending(self, limit: int, enqueued_until: datetime) -> list[UUID]:
        pool = await self._connector.pool()
        rows = await pool.fetch(
            "SELECT item_uuid FROM item_embedding_queue WHERE enqueued_at <= %s "
            "ORDER BY enqueued_at, item_uuid LIMIT %s",
            enqueued_until, limit,
        )
        return [row["item_uuid"] for row in rows]

    async def delete(self, item_ids: list[UUID], enqueued_until: datetime) -> None:
        pool = await self._connector.pool()
        await pool.execute(
            "DELETE FROM item_embedding_queue WHERE item_uuid = ANY(%s::uuid[]) AND enqueued_at <= %s",
            item_ids, enqueued_until,
        )

    async def get_creation_cursor(self) -> ItemCreationCursor | None:
        pool = await self._connector.pool()
        row = await pool.fetchrow("SELECT embedded_until, item_uuid FROM item_embedding_cursor")
        return ItemCreationCursor(row["embedded_until"], row["item_uuid"]) if row else None

    async def set_creation_cursor(self, cursor: ItemCreationCursor) -> None:
        pool = await self._connector.pool()
        await pool.execute(
            "INSERT INTO item_embedding_cursor (embedded_until, item_uuid) VALUES (%s, %s) "
            "ON CONFLICT (id) DO UPDATE SET embedded_until = EXCLUDED.embedded_until, item_uuid = EXCLUDED.item_uuid",
            cursor.created_at, cursor.item_uuid,
        )

    async def delete_all(self) -> None:
        pool = await self._connector.pool()
        await pool.execute("DELETE FROM item_embedding_queue")
        await pool.execute("DELETE FROM item_embedding_cursor")
