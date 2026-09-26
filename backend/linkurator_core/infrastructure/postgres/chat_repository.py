from __future__ import annotations

import json
from ipaddress import IPv4Address
from typing import Any
from uuid import UUID

from linkurator_core.domain.chats.chat import Chat, ChatMessage, ChatRole, ChatScope
from linkurator_core.domain.chats.chat_repository import ChatRepository
from linkurator_core.infrastructure.postgres.common import PostgresConnector, drop_nul_bytes


def _chat_scope_to_json(scope: ChatScope | None) -> str | None:
    if scope is None:
        return None
    return json.dumps({
        "subscription_ids": [str(uid) for uid in scope.subscription_ids],
        "topic_ids": [str(uid) for uid in scope.topic_ids],
        "curator_ids": [str(uid) for uid in scope.curator_ids],
        "text_search": scope.text_search,
        "min_duration": scope.min_duration,
        "max_duration": scope.max_duration,
        "include_items_without_interactions": scope.include_items_without_interactions,
        "include_recommended_items": scope.include_recommended_items,
        "include_discouraged_items": scope.include_discouraged_items,
        "include_viewed_items": scope.include_viewed_items,
        "include_hidden_items": scope.include_hidden_items,
        "excluded_subscriptions": [str(uid) for uid in scope.excluded_subscriptions],
    })


def _json_to_chat_scope(data: dict[str, Any] | None) -> ChatScope | None:
    if data is None:
        return None
    return ChatScope(
        subscription_ids=[UUID(uid) for uid in data.get("subscription_ids", [])],
        topic_ids=[UUID(uid) for uid in data.get("topic_ids", [])],
        curator_ids=[UUID(uid) for uid in data.get("curator_ids", [])],
        text_search=data.get("text_search"),
        min_duration=data.get("min_duration"),
        max_duration=data.get("max_duration"),
        include_items_without_interactions=data.get("include_items_without_interactions", True),
        include_recommended_items=data.get("include_recommended_items", True),
        include_discouraged_items=data.get("include_discouraged_items", True),
        include_viewed_items=data.get("include_viewed_items", True),
        include_hidden_items=data.get("include_hidden_items", True),
        excluded_subscriptions=[UUID(uid) for uid in data.get("excluded_subscriptions", [])],
    )


def _row_to_message(row: Any) -> ChatMessage:
    return ChatMessage(
        role=ChatRole(row["role"]),
        content=row["content"],
        timestamp=row["timestamp"],
        item_uuids=list(row["item_uuids"]),
        subscription_uuids=list(row["subscription_uuids"]),
        topic_uuids=list(row["topic_uuids"]),
        topic_were_created=row["topic_were_created"],
        scope=_json_to_chat_scope(row["scope"]),
    )


def _row_to_chat(chat_row: Any, message_rows: list[Any]) -> Chat:
    return Chat(
        uuid=chat_row["uuid"],
        user_id=chat_row["user_id"],
        title=chat_row["title"],
        messages=[_row_to_message(row) for row in message_rows],
        created_at=chat_row["created_at"],
        updated_at=chat_row["updated_at"],
    )


def _escape_like(value: str) -> str:
    return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


async def _insert_messages(conn: Any, chat_id: UUID, messages: list[ChatMessage]) -> None:
    if len(messages) == 0:
        return
    await conn.executemany(
        """
        INSERT INTO chat_messages (
            chat_id, seq, role, content, timestamp,
            item_uuids, subscription_uuids, topic_uuids, topic_were_created, scope
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
        """,
        [
            (
                chat_id, seq, message.role.value, drop_nul_bytes(message.content), message.timestamp,
                message.item_uuids, message.subscription_uuids, message.topic_uuids,
                message.topic_were_created, _chat_scope_to_json(message.scope),
            )
            for seq, message in enumerate(messages)
        ],
    )


class PostgresChatRepository(ChatRepository):
    def __init__(self, ip: IPv4Address, port: int, db_name: str, username: str, password: str) -> None:
        super().__init__()
        self._connector = PostgresConnector(ip, port, db_name, username, password)

    async def add(self, chat: Chat) -> None:
        pool = await self._connector.pool()
        async with pool.acquire() as conn, conn.transaction():
            await conn.execute(
                """
                INSERT INTO chats (uuid, user_id, title, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s)
                """,
                chat.uuid, chat.user_id, drop_nul_bytes(chat.title), chat.created_at, chat.updated_at,
            )
            await _insert_messages(conn, chat.uuid, chat.messages)

    async def get(self, chat_id: UUID) -> Chat | None:
        pool = await self._connector.pool()
        chat_row = await pool.fetchrow("SELECT * FROM chats WHERE uuid = %s", chat_id)
        if chat_row is None:
            return None
        message_rows = await pool.fetch(
            "SELECT * FROM chat_messages WHERE chat_id = %s ORDER BY seq", chat_id,
        )
        return _row_to_chat(chat_row, message_rows)

    async def get_by_user_id(
        self,
        user_id: UUID,
        page_number: int = 0,
        page_size: int = 50,
        title_filter: str | None = None,
    ) -> list[Chat]:
        pool = await self._connector.pool()
        title_pattern = f"%{_escape_like(title_filter)}%" if title_filter else None
        chat_rows = await pool.fetch(
            """
            SELECT * FROM chats
            WHERE user_id = %s
                AND (%s::text IS NULL OR immutable_unaccent(title) ILIKE immutable_unaccent(%s))
            ORDER BY updated_at DESC
            LIMIT %s OFFSET %s
            """,
            user_id, title_pattern, title_pattern, page_size, page_number * page_size,
        )
        chats = []
        for chat_row in chat_rows:
            message_rows = await pool.fetch(
                "SELECT * FROM chat_messages WHERE chat_id = %s ORDER BY seq", chat_row["uuid"],
            )
            chats.append(_row_to_chat(chat_row, message_rows))
        return chats

    async def update(self, chat: Chat) -> None:
        pool = await self._connector.pool()
        async with pool.acquire() as conn, conn.transaction():
            result = await conn.execute(
                "UPDATE chats SET user_id = %s, title = %s, updated_at = %s WHERE uuid = %s",
                chat.user_id, drop_nul_bytes(chat.title), chat.updated_at, chat.uuid,
            )
            if result == "UPDATE 0":
                return
            await conn.execute("DELETE FROM chat_messages WHERE chat_id = %s", chat.uuid)
            await _insert_messages(conn, chat.uuid, chat.messages)

    async def delete(self, chat_id: UUID) -> None:
        pool = await self._connector.pool()
        await pool.execute("DELETE FROM chats WHERE uuid = %s", chat_id)

    async def delete_all(self) -> None:
        pool = await self._connector.pool()
        await pool.execute("DELETE FROM chats")
