from __future__ import annotations

from psycopg import AsyncConnection
from psycopg.rows import TupleRow

from linkurator_core.infrastructure.postgres.migrations.base import BaseMigration


class Migration(BaseMigration):
    async def upgrade(self, conn: AsyncConnection[TupleRow]) -> None:
        # Create the item_embeddings table with a halfvec column for storing embeddings
        # halfvec is a custom data type for storing 1536-dimensional vectors in a compact format.
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
        await conn.execute("""
            CREATE TABLE item_embeddings (
                item_uuid UUID PRIMARY KEY,
                embedding halfvec(1536) NOT NULL,
                text_hash UUID,
                created_at TIMESTAMPTZ NOT NULL
            )
        """)

        # Create an index on the embedding column using HNSW
        # Use binary quantization to allow storing the whole index in RAM which is required for HNSW to be efficient.
        await conn.execute(
            "CREATE INDEX item_embeddings_embedding_idx "
            "ON item_embeddings USING hnsw ((binary_quantize(embedding)::bit(1536)) bit_hamming_ops)",
        )

        # Create a queue table for items that need to be embedded
        await conn.execute("""
            CREATE TABLE item_embedding_queue (
                item_uuid UUID PRIMARY KEY,
                enqueued_at TIMESTAMPTZ NOT NULL
            )
        """)
        await conn.execute(
            "CREATE INDEX item_embedding_queue_enqueued_at_idx"
            " ON item_embedding_queue (enqueued_at, item_uuid)",
        )

        # Create pointer to the last item that was embedded, so we can resume embedding from where we left off
        # in case of created_at is not unique, we will use the uuid as a tiebreaker
        await conn.execute("""
            CREATE TABLE item_embedding_cursor (
                id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
                embedded_until TIMESTAMPTZ NOT NULL,
                item_uuid UUID NOT NULL DEFAULT 'ffffffff-ffff-ffff-ffff-ffffffffffff'
            )
        """)
        await conn.execute(
            "CREATE INDEX items_creation_cursor_idx ON items (created_at, uuid) WHERE deleted_at IS NULL",
        )
