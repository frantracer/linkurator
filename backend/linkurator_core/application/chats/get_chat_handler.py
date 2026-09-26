from dataclasses import dataclass, field
from typing import Optional
from uuid import UUID

from linkurator_core.domain.chats.chat import Chat, ChatMessage
from linkurator_core.domain.chats.chat_repository import ChatRepository
from linkurator_core.domain.items.interaction import Interaction
from linkurator_core.domain.items.item import Item
from linkurator_core.domain.items.item_repository import ItemFilterCriteria, ItemRepository
from linkurator_core.domain.items.item_with_interactions import CuratorInteractions
from linkurator_core.domain.subscriptions.subscription import Subscription
from linkurator_core.domain.subscriptions.subscription_repository import SubscriptionRepository
from linkurator_core.domain.topics.topic import Topic
from linkurator_core.domain.topics.topic_repository import TopicRepository
from linkurator_core.domain.users.user_repository import UserRepository


@dataclass
class EnrichedChatMessage:
    message: ChatMessage
    items: list[Item]
    subscriptions: list[Subscription]
    topics: list[Topic]
    user_interactions: list[Interaction] = field(default_factory=list)
    curator_interactions: list[CuratorInteractions] = field(default_factory=list)


@dataclass
class EnrichedChat:
    chat: Chat
    enriched_messages: list[EnrichedChatMessage]
    is_waiting_for_response: bool


class GetChatHandler:
    def __init__(
        self,
        chat_repository: ChatRepository,
        item_repository: ItemRepository,
        subscription_repository: SubscriptionRepository,
        topic_repository: TopicRepository,
        user_repository: UserRepository,
    ) -> None:
        self.chat_repository = chat_repository
        self.item_repository = item_repository
        self.subscription_repository = subscription_repository
        self.topic_repository = topic_repository
        self.user_repository = user_repository

    async def handle(self, chat_id: UUID, user_id: UUID | None) -> Optional[EnrichedChat]:
        chat = await self.chat_repository.get(chat_id)
        if chat is None or chat.user_id != user_id:
            return None

        # Enrich chat messages with referenced objects
        enriched_messages = []
        for message in chat.messages:
            # Collect all UUIDs from the message
            referenced_items_uuids = set(message.item_uuids)
            referenced_subs_uuids = set(message.subscription_uuids)
            referenced_topics_uuids = set(message.topic_uuids)

            # Fetch referenced objects
            items = []
            if referenced_items_uuids:
                items = await self.item_repository.find_items(
                    criteria=ItemFilterCriteria(item_ids=referenced_items_uuids),
                    page_number=0,
                    limit=len(referenced_items_uuids),
                )

            related_subs_uuids = {item.subscription_uuid for item in items if item.subscription_uuid}
            all_subs_uuids = referenced_subs_uuids.union(related_subs_uuids)

            subscriptions = []
            if all_subs_uuids:
                subscriptions = await self.subscription_repository.get_list(list(all_subs_uuids))

            topics = []
            if referenced_topics_uuids:
                topics = await self.topic_repository.find_topics(list(referenced_topics_uuids))

            enriched_message = EnrichedChatMessage(
                message=message,
                items=items,
                subscriptions=subscriptions,
                topics=topics,
            )
            enriched_messages.append(enriched_message)

        if user_id is not None:
            await self._add_interactions(user_id, enriched_messages)

        return EnrichedChat(
            chat=chat,
            enriched_messages=enriched_messages,
            is_waiting_for_response=chat.is_waiting_for_response(),
        )

    async def _add_interactions(self, user_id: UUID, enriched_messages: list[EnrichedChatMessage]) -> None:
        item_ids = list({item.uuid for enriched_msg in enriched_messages for item in enriched_msg.items})
        if not item_ids:
            return

        user_interactions_by_item = await self.item_repository.get_user_interactions_by_item_id(
            user_id=user_id, item_ids=item_ids)

        curator_interactions_by_item: dict[UUID, list[CuratorInteractions]] = {}
        user = await self.user_repository.get(user_id)
        for curator_id in user.curators if user is not None else set():
            curator = await self.user_repository.get(curator_id)
            if curator is None:
                continue
            interactions_by_item = await self.item_repository.get_user_interactions_by_item_id(
                user_id=curator.uuid, item_ids=item_ids)
            for item_id, interactions in interactions_by_item.items():
                curator_interactions_by_item.setdefault(item_id, []).append(
                    CuratorInteractions(curator=curator, interactions=interactions),
                )

        for enriched_msg in enriched_messages:
            enriched_msg.user_interactions = [
                interaction for item in enriched_msg.items
                for interaction in user_interactions_by_item.get(item.uuid, [])
            ]
            enriched_msg.curator_interactions = [
                curator_interaction for item in enriched_msg.items
                for curator_interaction in curator_interactions_by_item.get(item.uuid, [])
            ]
