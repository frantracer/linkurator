from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from linkurator_core.application.chats.get_chat_handler import EnrichedChat
from linkurator_core.domain.chats.chat import Chat, ChatMessage, ChatScope
from linkurator_core.domain.items.item import Item
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.infrastructure.fastapi.models.agent import chat_scope_included_interactions
from linkurator_core.infrastructure.fastapi.models.item import InteractionFilterSchema, ItemSchema


class ChatScopeResponse(BaseModel):
    subscription_ids: list[UUID] = Field(default_factory=list)
    topic_ids: list[UUID] = Field(default_factory=list)
    curator_ids: list[UUID] = Field(default_factory=list)
    text_search: str | None = Field(default=None)
    min_duration: int | None = Field(default=None)
    max_duration: int | None = Field(default=None)
    include_interactions: list[InteractionFilterSchema] = Field(default_factory=list)
    excluded_subscriptions: list[UUID] = Field(default_factory=list)

    @classmethod
    def from_domain(cls, scope: ChatScope) -> "ChatScopeResponse":
        return cls(
            subscription_ids=scope.subscription_ids,
            topic_ids=scope.topic_ids,
            curator_ids=scope.curator_ids,
            text_search=scope.text_search,
            min_duration=scope.min_duration,
            max_duration=scope.max_duration,
            include_interactions=chat_scope_included_interactions(scope),
            excluded_subscriptions=scope.excluded_subscriptions,
        )


class ChatMessageResponse(BaseModel):
    role: str = Field(description="Message role: 'user' or 'assistant'")
    content: str = Field(description="Message content")
    timestamp: datetime = Field(description="Message timestamp")
    items: list[ItemSchema] = Field(default_factory=list, description="Items referenced in this message")
    topics_were_created: bool = Field(description="Indicates if new topics were created as a result of this message")
    scope: ChatScopeResponse | None = Field(
        default=None,
        description="Scope the message was sent with",
    )

    @classmethod
    def from_domain(
        cls,
        message: ChatMessage,
        items: list[Item] | None = None,
        subscriptions: list[Subscription] | None = None,
    ) -> "ChatMessageResponse":
        indexed_subscriptions = {sub.uuid: sub for sub in (subscriptions or [])}

        item_responses = [
            ItemSchema.from_domain_item(
                item=item,
                subscription=indexed_subscriptions[item.subscription_uuid],
            )
            for item in (items or [])
        ]

        return cls(
            role=message.role,
            content=message.content,
            timestamp=message.timestamp,
            items=item_responses,
            topics_were_created=message.topic_were_created,
            scope=ChatScopeResponse.from_domain(message.scope) if message.scope else None,
        )


class ChatResponse(BaseModel):
    uuid: UUID = Field(description="Chat unique identifier")
    user_id: UUID | None = Field(description="User ID who owns the chat")
    title: str = Field(description="Chat title")
    messages: list[ChatMessageResponse] = Field(description="Chat messages")
    is_waiting_for_response: bool = Field(description="Indicates if the chat is waiting for an AI response")
    created_at: datetime = Field(description="Chat creation timestamp")
    updated_at: datetime = Field(description="Chat last update timestamp")

    @classmethod
    def from_domain(cls, chat: Chat) -> "ChatResponse":
        return cls(
            uuid=chat.uuid,
            user_id=chat.user_id,
            title=chat.title,
            messages=[ChatMessageResponse.from_domain(msg) for msg in chat.messages],
            is_waiting_for_response=chat.is_waiting_for_response(),
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )

    @classmethod
    def from_enriched_chat(cls, enriched_chat: EnrichedChat) -> "ChatResponse":
        """Create ChatResponse from EnrichedChat with populated objects."""
        enriched_messages = []
        for enriched_msg in enriched_chat.enriched_messages:
            chat_msg_response = ChatMessageResponse.from_domain(
                message=enriched_msg.message,
                items=enriched_msg.items,
                subscriptions=enriched_msg.subscriptions,
            )
            enriched_messages.append(chat_msg_response)

        return cls(
            uuid=enriched_chat.chat.uuid,
            user_id=enriched_chat.chat.user_id,
            title=enriched_chat.chat.title,
            messages=enriched_messages,
            is_waiting_for_response=enriched_chat.is_waiting_for_response,
            created_at=enriched_chat.chat.created_at,
            updated_at=enriched_chat.chat.updated_at,
        )


class CreateChatRequest(BaseModel):
    title: str = Field(description="Chat title", min_length=1, max_length=200)


class CreateChatResponse(BaseModel):
    chat: ChatResponse = Field(description="Created chat")

    @classmethod
    def from_domain(cls, chat: Chat) -> "CreateChatResponse":
        return cls(
            chat=ChatResponse.from_domain(chat),
        )


class ChatSummaryResponse(BaseModel):
    uuid: UUID = Field(description="Chat unique identifier")
    user_id: UUID | None = Field(description="User ID who owns the chat")
    title: str = Field(description="Chat title")
    created_at: datetime = Field(description="Chat creation timestamp")
    updated_at: datetime = Field(description="Chat last update timestamp")

    @classmethod
    def from_domain(cls, chat: Chat) -> "ChatSummaryResponse":
        return cls(
            uuid=chat.uuid,
            user_id=chat.user_id,
            title=chat.title,
            created_at=chat.created_at,
            updated_at=chat.updated_at,
        )
