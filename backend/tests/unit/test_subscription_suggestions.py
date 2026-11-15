from uuid import uuid4

from linkurator_core.domain.common.mock_factory import mock_topic
from linkurator_core.domain.topics.subscription_suggestions import suggest_subscriptions


def test_no_suggestions_when_there_are_no_subscriptions_in_common() -> None:
    curator_topic = mock_topic(subscription_uuids=[uuid4(), uuid4()])

    suggestions = suggest_subscriptions(
        curator_topics=[curator_topic],
        user_topics=[],
        user_subscription_ids={uuid4()},
    )

    assert suggestions.common_subscription_ids == []
    assert suggestions.topics == []
    assert suggestions.candidate_scores == {}


def test_suggests_the_not_followed_subscriptions_of_topics_with_subscriptions_in_common() -> None:
    shared_sub = uuid4()
    candidate_sub = uuid4()
    curator_topic = mock_topic(subscription_uuids=[shared_sub, candidate_sub])

    suggestions = suggest_subscriptions(
        curator_topics=[curator_topic],
        user_topics=[],
        user_subscription_ids={shared_sub},
    )

    assert suggestions.common_subscription_ids == [shared_sub]
    assert len(suggestions.topics) == 1
    assert suggestions.topics[0].topic == curator_topic
    assert suggestions.topics[0].shared_subscription_ids == [shared_sub]
    assert suggestions.topics[0].candidate_subscription_ids == [candidate_sub]
    assert suggestions.topics[0].affinity == 0.5
    assert suggestions.topics[0].matching_user_topic_id is None
    assert suggestions.candidate_scores == {candidate_sub: 0.5}


def test_focused_topics_rank_before_catch_all_topics() -> None:
    shared_sub = uuid4()
    focused_topic = mock_topic(subscription_uuids=[shared_sub, uuid4()])
    catch_all_topic = mock_topic(subscription_uuids=[shared_sub, uuid4(), uuid4(), uuid4()])

    suggestions = suggest_subscriptions(
        curator_topics=[catch_all_topic, focused_topic],
        user_topics=[],
        user_subscription_ids={shared_sub},
    )

    assert [suggestion.topic for suggestion in suggestions.topics] == [focused_topic, catch_all_topic]
    assert suggestions.topics[0].affinity == 0.5
    assert suggestions.topics[1].affinity == 0.25


def test_candidates_in_several_matching_topics_score_higher() -> None:
    shared_sub = uuid4()
    single_topic_candidate = uuid4()
    repeated_candidate = uuid4()
    first_topic = mock_topic(subscription_uuids=[shared_sub, single_topic_candidate, repeated_candidate])
    second_topic = mock_topic(subscription_uuids=[shared_sub, repeated_candidate])

    suggestions = suggest_subscriptions(
        curator_topics=[first_topic, second_topic],
        user_topics=[],
        user_subscription_ids={shared_sub},
    )

    assert suggestions.common_subscription_ids == [shared_sub]
    assert suggestions.candidate_scores[repeated_candidate] > suggestions.candidate_scores[single_topic_candidate]
    first_topic_suggestion = next(suggestion for suggestion in suggestions.topics if suggestion.topic == first_topic)
    assert first_topic_suggestion.candidate_subscription_ids == [repeated_candidate, single_topic_candidate]


def test_matches_the_user_topic_sharing_most_subscriptions() -> None:
    shared_sub_1 = uuid4()
    shared_sub_2 = uuid4()
    curator_topic = mock_topic(subscription_uuids=[shared_sub_1, shared_sub_2, uuid4()])
    weak_user_topic = mock_topic(subscription_uuids=[shared_sub_1])
    strong_user_topic = mock_topic(subscription_uuids=[shared_sub_1, shared_sub_2])
    unrelated_user_topic = mock_topic(subscription_uuids=[uuid4()])

    suggestions = suggest_subscriptions(
        curator_topics=[curator_topic],
        user_topics=[weak_user_topic, unrelated_user_topic, strong_user_topic],
        user_subscription_ids={shared_sub_1, shared_sub_2},
    )

    assert suggestions.topics[0].matching_user_topic_id == strong_user_topic.uuid


def test_no_matching_user_topic_when_none_shares_subscriptions() -> None:
    shared_sub = uuid4()
    curator_topic = mock_topic(subscription_uuids=[shared_sub, uuid4()])
    user_topic = mock_topic(subscription_uuids=[uuid4()])

    suggestions = suggest_subscriptions(
        curator_topics=[curator_topic],
        user_topics=[user_topic],
        user_subscription_ids={shared_sub},
    )

    assert suggestions.topics[0].matching_user_topic_id is None
