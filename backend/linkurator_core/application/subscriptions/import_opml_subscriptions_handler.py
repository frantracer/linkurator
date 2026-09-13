from __future__ import annotations

import asyncio
import contextlib
import logging
from dataclasses import dataclass
from uuid import UUID, uuid4

from linkurator_core.domain.common.event import (
    SubscriptionItemsBecameOutdatedEvent,
    SubscriptionNeedsSummarizationEvent,
)
from linkurator_core.domain.common.event_bus_service import EventBusService
from linkurator_core.domain.common.exceptions import DuplicatedKeyError
from linkurator_core.domain.common.utils import parse_url
from linkurator_core.domain.subscriptions.general_subscription_service import GeneralSubscriptionService
from linkurator_core.domain.subscriptions.opml_parser import parse_opml_groups
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.topic import Topic
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user_repository import UserRepository

RSS_PROVIDER_NAME = "rss"

# A single slow or dead feed shouldn't be able to stall the whole import: each feed is
# resolved with its own timeout, and feeds are resolved concurrently (bounded so an OPML
# file with hundreds of feeds doesn't open hundreds of connections at once).
FEED_RESOLUTION_TIMEOUT_SECONDS = 15
MAX_CONCURRENT_FEED_RESOLUTIONS = 10


@dataclass
class ImportOpmlResult:
    imported: int = 0
    already_followed: int = 0
    failed: int = 0
    topics_created: int = 0


class ImportOpmlSubscriptionsHandler:
    def __init__(
        self,
        subscription_service: GeneralSubscriptionService,
        user_repository: UserRepository,
        subscription_repository: SubscriptionRepository,
        topic_repository: TopicRepository,
        event_bus_service: EventBusService,
    ) -> None:
        self.subscription_service = subscription_service
        self.user_repository = user_repository
        self.subscription_repository = subscription_repository
        self.topic_repository = topic_repository
        self.event_bus_service = event_bus_service

    async def handle(self, user_id: UUID, opml_content: str, create_topics: bool) -> ImportOpmlResult:
        user = await self.user_repository.get(user_id)
        if user is None:
            return ImportOpmlResult()

        result = ImportOpmlResult()

        try:
            groups = parse_opml_groups(opml_content)
        except Exception as e:
            logging.exception("Failed to parse OPML file for user %s: %s", user_id, e)
            return result

        all_feed_urls = list(dict.fromkeys(url for group in groups for url in group.feed_urls))
        semaphore = asyncio.Semaphore(MAX_CONCURRENT_FEED_RESOLUTIONS)
        resolved_subscriptions = await asyncio.gather(
            *[self._resolve_feed(feed_url, semaphore) for feed_url in all_feed_urls],
        )
        subscription_by_url = dict(zip(all_feed_urls, resolved_subscriptions))

        for group in groups:
            group_subscription_ids: list[UUID] = []
            for feed_url in group.feed_urls:
                subscription = subscription_by_url[feed_url]
                if subscription is None:
                    result.failed += 1
                    continue

                try:
                    registered = await self._get_or_create_subscription(subscription)
                    if registered.uuid in user.get_subscriptions():
                        result.already_followed += 1
                    else:
                        user.follow_subscription(registered.uuid)
                        result.imported += 1
                    group_subscription_ids.append(registered.uuid)
                except Exception as e:
                    logging.exception("Failed to import RSS feed %s for user %s: %s", feed_url, user_id, e)
                    result.failed += 1

            if create_topics and group.name is not None and group_subscription_ids:
                with contextlib.suppress(DuplicatedKeyError):
                    await self.topic_repository.add(
                        Topic.new(uuid=uuid4(), name=group.name, user_id=user_id,
                                  subscription_ids=group_subscription_ids))
                    result.topics_created += 1

        await self.user_repository.update(user)

        return result

    async def _resolve_feed(self, feed_url: str, semaphore: asyncio.Semaphore) -> Subscription | None:
        try:
            async with semaphore:
                return await asyncio.wait_for(
                    self.subscription_service.get_subscription_from_url(
                        parse_url(feed_url), provider=RSS_PROVIDER_NAME),
                    timeout=FEED_RESOLUTION_TIMEOUT_SECONDS)
        except Exception as e:
            logging.exception("Failed to resolve RSS feed %s: %s", feed_url, e)
            return None

    async def _get_or_create_subscription(self, subscription: Subscription) -> Subscription:
        registered_subscription = await self.subscription_repository.find_by_url(subscription.url)
        if registered_subscription is None:
            await self.subscription_repository.add(subscription)
            await self.event_bus_service.publish(SubscriptionNeedsSummarizationEvent.new(subscription.uuid))
            await self.event_bus_service.publish(SubscriptionItemsBecameOutdatedEvent.new(subscription.uuid))
            return subscription
        return registered_subscription
