from uuid import uuid4

import pytest

from linkurator_core.application.topics.get_curator_suggestions_handler import GetCuratorSuggestionsHandler
from linkurator_core.domain.common.exceptions import UserNotFoundError
from linkurator_core.domain.common.mock_factory import mock_sub, mock_topic, mock_user
from linkurator_core.infrastructure.in_memory.subscription_repository import InMemorySubscriptionRepository
from linkurator_core.infrastructure.in_memory.topic_repository import InMemoryTopicRepository
from linkurator_core.infrastructure.in_memory.user_repository import InMemoryUserRepository


@pytest.mark.asyncio()
async def test_get_curator_suggestions_returns_common_and_candidate_subscriptions() -> None:
    user_repository = InMemoryUserRepository()
    topic_repository = InMemoryTopicRepository()
    subscription_repository = InMemorySubscriptionRepository()

    shared_sub = mock_sub()
    candidate_sub = mock_sub()
    unrelated_sub = mock_sub()
    for sub in [shared_sub, candidate_sub, unrelated_sub]:
        await subscription_repository.add(sub)

    user = mock_user(subscribed_to=[shared_sub.uuid])
    curator = mock_user(subscribed_to=[shared_sub.uuid, candidate_sub.uuid, unrelated_sub.uuid])
    await user_repository.add(user)
    await user_repository.add(curator)

    curator_topic = mock_topic(user_uuid=curator.uuid, subscription_uuids=[shared_sub.uuid, candidate_sub.uuid])
    user_topic = mock_topic(user_uuid=user.uuid, subscription_uuids=[shared_sub.uuid])
    await topic_repository.add(curator_topic)
    await topic_repository.add(user_topic)

    handler = GetCuratorSuggestionsHandler(
        topic_repository=topic_repository,
        user_repository=user_repository,
        subscription_repository=subscription_repository,
    )

    response = await handler.handle(user_id=user.uuid, curator_id=curator.uuid)

    assert response.curator == curator
    assert response.user == user
    assert response.suggestions.common_subscription_ids == [shared_sub.uuid]
    assert len(response.suggestions.topics) == 1
    assert response.suggestions.topics[0].candidate_subscription_ids == [candidate_sub.uuid]
    assert response.suggestions.topics[0].matching_user_topic_id == user_topic.uuid
    assert {sub.uuid for sub in response.subscriptions} == {shared_sub.uuid, candidate_sub.uuid}


@pytest.mark.asyncio()
async def test_get_curator_suggestions_raises_when_curator_does_not_exist() -> None:
    user_repository = InMemoryUserRepository()
    user = mock_user()
    await user_repository.add(user)

    handler = GetCuratorSuggestionsHandler(
        topic_repository=InMemoryTopicRepository(),
        user_repository=user_repository,
        subscription_repository=InMemorySubscriptionRepository(),
    )

    with pytest.raises(UserNotFoundError):
        await handler.handle(user_id=user.uuid, curator_id=uuid4())


@pytest.mark.asyncio()
async def test_get_curator_suggestions_raises_when_user_does_not_exist() -> None:
    user_repository = InMemoryUserRepository()
    curator = mock_user()
    await user_repository.add(curator)

    handler = GetCuratorSuggestionsHandler(
        topic_repository=InMemoryTopicRepository(),
        user_repository=user_repository,
        subscription_repository=InMemorySubscriptionRepository(),
    )

    with pytest.raises(UserNotFoundError):
        await handler.handle(user_id=uuid4(), curator_id=curator.uuid)
