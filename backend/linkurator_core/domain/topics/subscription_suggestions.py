from __future__ import annotations

from dataclasses import dataclass
from uuid import UUID

from linkurator_core.domain.topics.topic import Topic


@dataclass
class TopicSuggestion:
    topic: Topic
    shared_subscription_ids: list[UUID]
    candidate_subscription_ids: list[UUID]
    affinity: float
    matching_user_topic_id: UUID | None


@dataclass
class SubscriptionSuggestions:
    common_subscription_ids: list[UUID]
    topics: list[TopicSuggestion]
    candidate_scores: dict[UUID, float]


def suggest_subscriptions(
    curator_topics: list[Topic],
    user_topics: list[Topic],
    user_subscription_ids: set[UUID],
) -> SubscriptionSuggestions:
    """
    Suggests the subscriptions of the curator topics that share subscriptions with the user.

    A topic's affinity is the share of its subscriptions the user already follows, so small focused topics
    weigh more than big catch-all ones. A candidate's score adds up the affinity of every topic it is in.
    """
    common_subscription_ids: list[UUID] = []
    candidate_scores: dict[UUID, float] = {}
    matching_topics: list[tuple[Topic, list[UUID], float]] = []

    for topic in curator_topics:
        topic_subscription_ids = list(dict.fromkeys(topic.subscriptions_ids))
        shared_subscription_ids = [sub_id for sub_id in topic_subscription_ids if sub_id in user_subscription_ids]
        if len(shared_subscription_ids) == 0:
            continue

        affinity = len(shared_subscription_ids) / len(topic_subscription_ids)
        matching_topics.append((topic, shared_subscription_ids, affinity))

        for sub_id in shared_subscription_ids:
            if sub_id not in common_subscription_ids:
                common_subscription_ids.append(sub_id)

        for sub_id in topic_subscription_ids:
            if sub_id not in user_subscription_ids:
                candidate_scores[sub_id] = candidate_scores.get(sub_id, 0.0) + affinity

    topic_suggestions = [
        TopicSuggestion(
            topic=topic,
            shared_subscription_ids=shared_subscription_ids,
            candidate_subscription_ids=sorted(
                [sub_id for sub_id in dict.fromkeys(topic.subscriptions_ids) if sub_id in candidate_scores],
                key=lambda sub_id: candidate_scores[sub_id],
                reverse=True,
            ),
            affinity=affinity,
            matching_user_topic_id=_find_matching_user_topic_id(topic, user_topics),
        )
        for topic, shared_subscription_ids, affinity in matching_topics
    ]
    topic_suggestions.sort(
        key=lambda suggestion: (suggestion.affinity, len(suggestion.shared_subscription_ids)),
        reverse=True,
    )

    return SubscriptionSuggestions(
        common_subscription_ids=common_subscription_ids,
        topics=topic_suggestions,
        candidate_scores=candidate_scores,
    )


def _find_matching_user_topic_id(curator_topic: Topic, user_topics: list[Topic]) -> UUID | None:
    curator_subscription_ids = set(curator_topic.subscriptions_ids)
    best_topic_id: UUID | None = None
    best_overlap = 0
    for user_topic in user_topics:
        overlap = len(curator_subscription_ids.intersection(user_topic.subscriptions_ids))
        if overlap > best_overlap:
            best_topic_id = user_topic.uuid
            best_overlap = overlap
    return best_topic_id
