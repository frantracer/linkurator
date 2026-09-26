from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from uuid import UUID


class ChatRole(StrEnum):
    USER = "user"
    ASSISTANT = "assistant"
    ERROR = "error"


@dataclass
class ChatScope:
    """
    Restricts a chat's item retrieval to subscriptions/topics/curators plus filters.

    With no ids the whole library is searched, but the filters still apply.
    """

    subscription_ids: list[UUID] = field(default_factory=list)
    topic_ids: list[UUID] = field(default_factory=list)
    curator_ids: list[UUID] = field(default_factory=list)
    text_search: str | None = None
    min_duration: int | None = None
    max_duration: int | None = None
    include_items_without_interactions: bool = True
    include_recommended_items: bool = True
    include_discouraged_items: bool = True
    include_viewed_items: bool = True
    include_hidden_items: bool = True
    excluded_subscriptions: list[UUID] = field(default_factory=list)

    def has_entity_restriction(self) -> bool:
        return bool(self.subscription_ids or self.topic_ids or self.curator_ids)


@dataclass
class ChatMessage:
    role: ChatRole
    content: str
    timestamp: datetime
    item_uuids: list[UUID]
    subscription_uuids: list[UUID]
    topic_uuids: list[UUID]
    topic_were_created: bool
    scope: ChatScope | None = None

    @classmethod
    def new_user_message(cls, content: str, scope: ChatScope | None = None) -> ChatMessage:
        return cls(
            role=ChatRole.USER,
            content=content,
            timestamp=datetime.now(timezone.utc),
            item_uuids=[],
            subscription_uuids=[],
            topic_uuids=[],
            topic_were_created=False,
            scope=scope,
        )

    @classmethod
    def new_assistant_message(
        cls,
        content: str,
        item_uuids: list[UUID] | None = None,
        subscription_uuids: list[UUID] | None = None,
        topic_uuids: list[UUID] | None = None,
        topic_were_created: bool = False,
    ) -> ChatMessage:
        return cls(
            role=ChatRole.ASSISTANT,
            content=content,
            timestamp=datetime.now(timezone.utc),
            item_uuids=item_uuids or [],
            subscription_uuids=subscription_uuids or [],
            topic_uuids=topic_uuids or [],
            topic_were_created=topic_were_created,
        )

    @classmethod
    def new_error_message(cls, content: str) -> ChatMessage:
        return cls(
            role=ChatRole.ERROR,
            content=content,
            timestamp=datetime.now(timezone.utc),
            item_uuids=[],
            subscription_uuids=[],
            topic_uuids=[],
            topic_were_created=False,
        )


@dataclass
class Chat:
    uuid: UUID
    user_id: UUID | None
    title: str
    messages: list[ChatMessage]
    created_at: datetime
    updated_at: datetime

    @classmethod
    def new(cls, uuid: UUID, user_id: UUID | None, title: str) -> Chat:
        now = datetime.now(timezone.utc)
        return cls(
            uuid=uuid,
            user_id=user_id,
            title=title,
            messages=[],
            created_at=now,
            updated_at=now,
        )

    def add_message(self, message: ChatMessage) -> None:
        self.messages.append(message)
        self.updated_at = datetime.now(timezone.utc)

    def add_user_message(self, content: str, scope: ChatScope | None = None) -> None:
        message = ChatMessage.new_user_message(content, scope)
        self.add_message(message)

    def add_assistant_message(
        self,
        content: str,
        item_uuids: list[UUID] | None = None,
        subscription_uuids: list[UUID] | None = None,
        topic_uuids: list[UUID] | None = None,
        topic_were_created: bool = False,
    ) -> None:
        message = ChatMessage.new_assistant_message(
            content,
            item_uuids=item_uuids,
            subscription_uuids=subscription_uuids,
            topic_uuids=topic_uuids,
            topic_were_created=topic_were_created,
        )
        self.add_message(message)

    def add_error_message(self, content: str) -> None:
        message = ChatMessage.new_error_message(content)
        self.add_message(message)

    def update_title(self, title: str) -> None:
        self.title = title
        self.updated_at = datetime.now(timezone.utc)

    def latest_scope(self) -> ChatScope | None:
        """Scope of the latest user message"""
        for message in reversed(self.messages):
            if message.role == ChatRole.USER:
                return message.scope
        return None

    def latest_entity_scope(self) -> ChatScope | None:
        """Scope of the latest user message, only when it restricts the chat to some entities"""
        scope = self.latest_scope()
        if scope is None or not scope.has_entity_restriction():
            return None
        return scope

    def is_waiting_for_response(self) -> bool:
        if len(self.messages) == 0:
            return False
        last_message = self.messages[-1]

        now = datetime.now(timezone.utc)
        return last_message.role == ChatRole.USER and now - last_message.timestamp < timedelta(minutes=5)
