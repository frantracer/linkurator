from __future__ import annotations

from psycopg import AsyncConnection
from psycopg.rows import TupleRow

from linkurator_core.infrastructure.postgres.migrations.base import BaseMigration


class Migration(BaseMigration):
    async def upgrade(self, conn: AsyncConnection[TupleRow]) -> None:
        # Items without embedding are searched in batches ordered by creation date
        await conn.execute("CREATE INDEX items_created_at_idx ON items (created_at)")
