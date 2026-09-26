from uuid import UUID

from pydantic import BaseModel, Field

from linkurator_core.domain.chats.chat import ChatScope
from linkurator_core.infrastructure.fastapi.models.item import InteractionFilterSchema


def chat_scope_included_interactions(scope: ChatScope) -> list[InteractionFilterSchema]:
    flags = [
        (scope.include_items_without_interactions, InteractionFilterSchema.WITHOUT_INTERACTIONS),
        (scope.include_recommended_items, InteractionFilterSchema.RECOMMENDED),
        (scope.include_discouraged_items, InteractionFilterSchema.DISCOURAGED),
        (scope.include_viewed_items, InteractionFilterSchema.VIEWED),
        (scope.include_hidden_items, InteractionFilterSchema.HIDDEN),
    ]
    return [interaction for included, interaction in flags if included]


class ChatScopeSchema(BaseModel):
    subscription_ids: list[UUID] = Field(
        default_factory=list,
        description="Restrict retrieval to items from these subscriptions",
    )
    topic_ids: list[UUID] = Field(
        default_factory=list,
        description="Restrict retrieval to items from these topics' subscriptions",
    )
    curator_ids: list[UUID] = Field(
        default_factory=list,
        description="Restrict retrieval to items recommended by these curators",
    )
    text_search: str | None = Field(default=None, description="Text filter active on the originating page")
    min_duration: int | None = Field(default=None, description="Minimum item duration in seconds")
    max_duration: int | None = Field(default=None, description="Maximum item duration in seconds")
    include_interactions: list[InteractionFilterSchema] | None = Field(
        default=None,
        description="Interaction states to include. None means include all of them.",
    )
    excluded_subscriptions: list[UUID] = Field(
        default_factory=list,
        description="Subscriptions to exclude, within a topic scope",
    )

    def to_domain(self) -> ChatScope:
        def includes(interaction: InteractionFilterSchema) -> bool:
            return self.include_interactions is None or interaction in self.include_interactions

        return ChatScope(
            subscription_ids=self.subscription_ids,
            topic_ids=self.topic_ids,
            curator_ids=self.curator_ids,
            text_search=self.text_search,
            min_duration=self.min_duration,
            max_duration=self.max_duration,
            include_items_without_interactions=includes(InteractionFilterSchema.WITHOUT_INTERACTIONS),
            include_recommended_items=includes(InteractionFilterSchema.RECOMMENDED),
            include_discouraged_items=includes(InteractionFilterSchema.DISCOURAGED),
            include_viewed_items=includes(InteractionFilterSchema.VIEWED),
            include_hidden_items=includes(InteractionFilterSchema.HIDDEN),
            excluded_subscriptions=self.excluded_subscriptions,
        )


class AgentQueryRequest(BaseModel):
    query: str = Field(
        description="The query to send to the AI agent",
        min_length=1,
        max_length=500,
    )
    scope: ChatScopeSchema | None = Field(
        default=None,
        description="Optional scope restricting this chat to a curator/subscription/topic's items "
                    "and page filters",
    )
