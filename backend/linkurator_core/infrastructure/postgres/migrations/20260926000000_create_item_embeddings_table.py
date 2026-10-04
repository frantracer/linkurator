from __future__ import annotations

from psycopg import AsyncConnection
from psycopg.rows import TupleRow

from linkurator_core.infrastructure.postgres.migrations.base import BaseMigration


class Migration(BaseMigration):
    async def upgrade(self, conn: AsyncConnection[TupleRow]) -> None:
        await conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
        await conn.execute("""
            CREATE TABLE item_embeddings (
                item_uuid UUID PRIMARY KEY,
                embedding halfvec(1536) NOT NULL,
                created_at TIMESTAMPTZ NOT NULL
            )
        """)
        # The HNSW index is built on the sign bits of each embedding (192 bytes instead of 3 KB),
        # so the whole index fits in memory. Searches use it to pick candidates and re-rank them
        # with the full embedding stored in the table.
        await conn.execute(
            "CREATE INDEX item_embeddings_embedding_idx "
            "ON item_embeddings USING hnsw ((binary_quantize(embedding)::bit(1536)) bit_hamming_ops)",
        )
