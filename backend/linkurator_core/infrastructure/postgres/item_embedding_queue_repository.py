from __future__ import annotations

from datetime import datetime, timezone
from ipaddress import IPv4Address
from uuid import UUID

from linkurator_core.domain.items.item_embedding_queue_repository import ItemEmbeddingQueueRepository
from linkurator_core.infrastructure.postgres.common import PostgresConnector


class PostgresItemEmbeddingQueueRepository(ItemEmbeddingQueueRepository):
    def __init__(self, ip: IPv4Address, port: int, db_name: str, username: str, password: str) -> None:
        self._connector = PostgresConnector(ip, port, db_name, username, password)

    async def enqueue(self, item_ids: list[UUID]) -> None:
        if len(item_ids) == 0:
            return
        pool = await self._connector.pool()
        await pool.execute(
            "INSERT INTO item_embedding_queue (item_uuid, enqueued_at) "
            "SELECT unnest(%s::uuid[]), %s ON CONFLICT DO NOTHING",
            item_ids, datetime.now(timezone.utc),
        )

    async def dequeue(self, limit: int) -> list[UUID]:
        pool = await self._connector.pool()
        rows = await pool.fetch(
            """
            DELETE FROM item_embedding_queue
            WHERE item_uuid IN (
                SELECT item_uuid FROM item_embedding_queue
                ORDER BY enqueued_at LIMIT %s FOR UPDATE SKIP LOCKED
            )
            RETURNING item_uuid
            """,
            limit,
        )
        return [row["item_uuid"] for row in rows]

    async def get_embedded_until(self) -> datetime | None:
        pool = await self._connector.pool()
        return await pool.fetchval("SELECT embedded_until FROM item_embedding_cursor")

    async def set_embedded_until(self, embedded_until: datetime) -> None:
        pool = await self._connector.pool()
        await pool.execute(
            "INSERT INTO item_embedding_cursor (embedded_until) VALUES (%s) "
            "ON CONFLICT (id) DO UPDATE SET embedded_until = EXCLUDED.embedded_until",
            embedded_until,
        )

    async def delete_all(self) -> None:
        pool = await self._connector.pool()
        await pool.execute("DELETE FROM item_embedding_queue")
        await pool.execute("DELETE FROM item_embedding_cursor")
