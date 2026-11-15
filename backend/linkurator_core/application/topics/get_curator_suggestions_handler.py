from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from linkurator_core.domain.common.exceptions import UserNotFoundError
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.subscription_suggestions import SubscriptionSuggestions, suggest_subscriptions
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user import User
from linkurator_core.domain.users.user_repository import UserRepository


@dataclass
class GetCuratorSuggestionsResponse:
    suggestions: SubscriptionSuggestions
    subscriptions: list[Subscription]
    curator: User
    user: User


class GetCuratorSuggestionsHandler:
    def __init__(self,
                 topic_repository: TopicRepository,
                 user_repository: UserRepository,
                 subscription_repository: SubscriptionRepository,
                 ) -> None:
        self.topic_repository = topic_repository
        self.user_repository = user_repository
        self.subscription_repository = subscription_repository

    async def handle(self, user_id: UUID, curator_id: UUID) -> GetCuratorSuggestionsResponse:
        curator = await self.user_repository.get(curator_id)
        if curator is None:
            raise UserNotFoundError(curator_id)

        user = await self.user_repository.get(user_id)
        if user is None:
            raise UserNotFoundError(user_id)

        curator_topics = await self.topic_repository.get_by_user_id(curator_id)
        user_topics = await self.topic_repository.get_by_user_id(user_id)

        suggestions = suggest_subscriptions(
            curator_topics=curator_topics,
            user_topics=user_topics,
            user_subscription_ids=user.get_subscriptions(),
        )

        subscription_ids = suggestions.common_subscription_ids + list(suggestions.candidate_scores.keys())
        subscriptions = await self.subscription_repository.get_list(subscription_ids)

        return GetCuratorSuggestionsResponse(
            suggestions=suggestions,
            subscriptions=subscriptions,
            curator=curator,
            user=user,
        )
