import uuid

import pytest

from linkurator_core.application.chats.get_chat_handler import GetChatHandler
from linkurator_core.domain.chats.chat import Chat, ChatMessage
from linkurator_core.domain.common.mock_factory import mock_interaction, mock_item, mock_sub, mock_user
from linkurator_core.domain.items.interaction import InteractionType
from linkurator_core.infrastructure.fastapi.models.chat import ChatResponse
from linkurator_core.infrastructure.in_memory.chat_repository import InMemoryChatRepository
from linkurator_core.infrastructure.in_memory.item_repository import InMemoryItemRepository
from linkurator_core.infrastructure.in_memory.subscription_repository import InMemorySubscriptionRepository
from linkurator_core.infrastructure.in_memory.topic_repository import InMemoryTopicRepository
from linkurator_core.infrastructure.in_memory.user_repository import InMemoryUserRepository


@pytest.mark.asyncio()
async def test_get_chat_returns_items_with_user_and_curator_interactions() -> None:
    chat_repository = InMemoryChatRepository()
    item_repository = InMemoryItemRepository()
    subscription_repository = InMemorySubscriptionRepository()
    user_repository = InMemoryUserRepository()

    curator = mock_user()
    user = mock_user(curators={curator.uuid})
    await user_repository.add(curator)
    await user_repository.add(user)

    sub = mock_sub()
    await subscription_repository.add(sub)
    recommended_item = mock_item(sub_uuid=sub.uuid)
    viewed_item = mock_item(sub_uuid=sub.uuid)
    await item_repository.upsert_items([recommended_item, viewed_item])
    await item_repository.add_interaction(mock_interaction(
        user_id=user.uuid, item_id=recommended_item.uuid, interaction_type=InteractionType.RECOMMENDED))
    await item_repository.add_interaction(mock_interaction(
        user_id=user.uuid, item_id=viewed_item.uuid, interaction_type=InteractionType.VIEWED))
    await item_repository.add_interaction(mock_interaction(
        user_id=curator.uuid, item_id=viewed_item.uuid, interaction_type=InteractionType.RECOMMENDED))

    chat = Chat.new(uuid=uuid.uuid4(), user_id=user.uuid, title="Chat")
    chat.messages.append(ChatMessage.new_assistant_message(
        content="Some items", item_uuids=[recommended_item.uuid, viewed_item.uuid]))
    await chat_repository.add(chat)

    handler = GetChatHandler(
        chat_repository=chat_repository,
        item_repository=item_repository,
        subscription_repository=subscription_repository,
        topic_repository=InMemoryTopicRepository(),
        user_repository=user_repository,
    )

    enriched_chat = await handler.handle(chat_id=chat.uuid, user_id=user.uuid)

    assert enriched_chat is not None
    response = ChatResponse.from_enriched_chat(enriched_chat)
    items_by_id = {item.uuid: item for item in response.messages[0].items}

    assert items_by_id[recommended_item.uuid].recommended
    assert not items_by_id[recommended_item.uuid].viewed
    assert items_by_id[recommended_item.uuid].recommended_by == []

    assert items_by_id[viewed_item.uuid].viewed
    assert not items_by_id[viewed_item.uuid].recommended
    assert [r.curator.id for r in items_by_id[viewed_item.uuid].recommended_by] == [curator.uuid]
