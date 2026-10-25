from __future__ import annotations

from psycopg import AsyncConnection
from psycopg.rows import TupleRow

from linkurator_core.infrastructure.postgres.migrations.base import BaseMigration


class Migration(BaseMigration):
    async def upgrade(self, conn: AsyncConnection[TupleRow]) -> None:
        await conn.execute("""
            CREATE TABLE notifications (
                uuid UUID PRIMARY KEY,
                user_id UUID NOT NULL,
                type TEXT NOT NULL,
                curator_id UUID NOT NULL,
                item_id UUID NOT NULL,
                content JSONB NOT NULL,
                created_at TIMESTAMPTZ NOT NULL,
                read_at TIMESTAMPTZ,
                UNIQUE (user_id, curator_id, item_id)
            )
        """)
        await conn.execute(
            "CREATE INDEX notifications_user_id_created_at_idx ON notifications (user_id, created_at DESC, uuid DESC)",
        )
        await conn.execute(
            "CREATE INDEX notifications_user_id_unread_idx ON notifications (user_id) WHERE read_at IS NULL",
        )

        # Followers of a curator are looked up every time the curator recommends an item
        await conn.execute("CREATE INDEX users_curators_idx ON users USING GIN (curators)")
