from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel

from linkurator_core.application.topics.get_curator_suggestions_handler import GetCuratorSuggestionsResponse
from linkurator_core.domain.topics.subscription_suggestions import TopicSuggestion
from linkurator_core.domain.users.user import User
from linkurator_core.infrastructure.fastapi.models.subscription import SubscriptionSchema
from linkurator_core.infrastructure.fastapi.models.topic import TopicSchema


class TopicSuggestionSchema(BaseModel):
    """Curator topic that shares subscriptions with the user, with the ones the user does not follow yet."""

    topic: TopicSchema
    shared_subscription_ids: list[UUID]
    candidate_subscription_ids: list[UUID]
    affinity: float
    matching_user_topic_id: UUID | None

    @classmethod
    def from_domain(cls, suggestion: TopicSuggestion, curator: User, user: User) -> TopicSuggestionSchema:
        return cls(
            topic=TopicSchema.from_domain_topic(topic=suggestion.topic, curator=curator, user=user),
            shared_subscription_ids=suggestion.shared_subscription_ids,
            candidate_subscription_ids=suggestion.candidate_subscription_ids,
            affinity=suggestion.affinity,
            matching_user_topic_id=suggestion.matching_user_topic_id,
        )


class CuratorSuggestionsSchema(BaseModel):
    """Subscriptions the user has in common with a curator and the ones they could follow next."""

    common_subscription_ids: list[UUID]
    topics: list[TopicSuggestionSchema]
    subscriptions: list[SubscriptionSchema]
    candidate_scores: dict[UUID, float]

    @classmethod
    def from_domain(cls, response: GetCuratorSuggestionsResponse) -> CuratorSuggestionsSchema:
        return cls(
            common_subscription_ids=response.suggestions.common_subscription_ids,
            topics=[
                TopicSuggestionSchema.from_domain(suggestion=suggestion, curator=response.curator, user=response.user)
                for suggestion in response.suggestions.topics
            ],
            subscriptions=[
                SubscriptionSchema.from_domain_subscription(subscription, response.user)
                for subscription in response.subscriptions
            ],
            candidate_scores=response.suggestions.candidate_scores,
        )
