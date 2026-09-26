from __future__ import annotations

import asyncio
from uuid import UUID

from linkurator_core.domain.chats.chat import ChatScope
from linkurator_core.domain.items.interaction import InteractionType
from linkurator_core.domain.items.item_repository import (
    AnyItemInteraction,
    InteractionFilterCriteria,
    ItemFilterCriteria,
    ItemRepository,
)
from linkurator_core.domain.topics.topic_repository import TopicRepository

MAX_SCOPE_CANDIDATE_ITEMS = 500


def scope_item_interactions(scope: ChatScope) -> AnyItemInteraction:
    return AnyItemInteraction(
        without_interactions=scope.include_items_without_interactions,
        recommended=scope.include_recommended_items,
        discouraged=scope.include_discouraged_items,
        viewed=scope.include_viewed_items,
        hidden=scope.include_hidden_items,
    )


async def _subscriptions_candidate_item_ids(
        scope: ChatScope,
        user_id: UUID | None,
        item_repository: ItemRepository,
        topic_repository: TopicRepository,
) -> set[UUID]:
    if not scope.subscription_ids and not scope.topic_ids:
        return set()

    subscription_ids = set(scope.subscription_ids)
    if scope.topic_ids:
        topics = await topic_repository.find_topics(scope.topic_ids)
        for topic in topics:
            subscription_ids.update(topic.subscriptions_ids)
    subscription_ids -= set(scope.excluded_subscriptions)

    items = await item_repository.find_items(
        criteria=ItemFilterCriteria(
            subscription_ids=list(subscription_ids),
            text=scope.text_search,
            min_duration=scope.min_duration,
            max_duration=scope.max_duration,
            interactions_from_user=user_id,
            interactions=scope_item_interactions(scope),
        ),
        page_number=0,
        limit=MAX_SCOPE_CANDIDATE_ITEMS,
    )
    return {item.uuid for item in items}


async def _curators_candidate_item_ids(scope: ChatScope, item_repository: ItemRepository) -> set[UUID]:
    if not scope.curator_ids:
        return set()

    interactions = await item_repository.find_interactions(
        criteria=InteractionFilterCriteria(
            user_ids=scope.curator_ids,
            interaction_types=[InteractionType.RECOMMENDED],
            text=scope.text_search,
            min_duration=scope.min_duration,
            max_duration=scope.max_duration,
        ),
        page_number=0,
        limit=MAX_SCOPE_CANDIDATE_ITEMS,
    )
    return {interaction.item_uuid for interaction in interactions}


async def resolve_scope_candidate_item_ids(
        scope: ChatScope,
        user_id: UUID | None,
        item_repository: ItemRepository,
        topic_repository: TopicRepository,
) -> set[UUID]:
    """
    Resolve the bounded set of item ids a scoped chat is allowed to retrieve from.

    Mirrors the criteria of the Get{Topic,Subscription,Curator}ItemsHandler.
    """
    subscriptions_item_ids, curators_item_ids = await asyncio.gather(
        _subscriptions_candidate_item_ids(scope, user_id, item_repository, topic_repository),
        _curators_candidate_item_ids(scope, item_repository),
    )
    return subscriptions_item_ids | curators_item_ids
