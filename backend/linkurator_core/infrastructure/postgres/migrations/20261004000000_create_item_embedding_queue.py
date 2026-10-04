from __future__ import annotations

from psycopg import AsyncConnection
from psycopg.rows import TupleRow

from linkurator_core.infrastructure.postgres.migrations.base import BaseMigration


class Migration(BaseMigration):
    async def upgrade(self, conn: AsyncConnection[TupleRow]) -> None:
        # MD5 of the text used for the embedding, stored in 16 bytes as a UUID. Existing embeddings have no
        # hash, so they are computed again the next time their items are processed.
        await conn.execute("ALTER TABLE item_embeddings ADD COLUMN text_hash UUID")
        await conn.execute("""
            CREATE TABLE item_embedding_queue (
                item_uuid UUID PRIMARY KEY,
                enqueued_at TIMESTAMPTZ NOT NULL
            )
        """)
        await conn.execute("CREATE INDEX item_embedding_queue_enqueued_at_idx ON item_embedding_queue (enqueued_at)")
        # Single row with the creation date of the last item enqueued by the search of new items to embed
        await conn.execute("""
            CREATE TABLE item_embedding_cursor (
                id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
                embedded_until TIMESTAMPTZ NOT NULL
            )
        """)
