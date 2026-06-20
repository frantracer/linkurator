import React, {useState} from "react";
import {flushSync} from "react-dom";
import {useTranslations} from "next-intl";
import {Subscription} from "../../entities/Subscription";
import FlexRow from "../atoms/FlexRow";
import {InfoBanner} from "../atoms/InfoBanner";
import {Spinner} from "../atoms/Spinner";
import SubscriptionCard from "./SubscriptionCard";
import AssignTopicModal, {AssignTopicModalId} from "./AssignTopicModal";
import useProfile from "../../hooks/useProfile";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useTopics} from "../../hooks/useTopics";
import {followSubscription, unfollowSubscription} from "../../services/subscriptionService";
import {openModal} from "../../utilities/modalAction";
import {useToast} from "../../contexts/ToastContext";

type CuratorSubscriptionsListProps = {
  subscriptions: Subscription[];
  isLoading: boolean;
  refreshSubscriptions: () => void;
}

const CuratorSubscriptionsList = (
  {
    subscriptions,
    isLoading,
    refreshSubscriptions,
  }: CuratorSubscriptionsListProps
) => {
  const t = useTranslations("common");
  const {showToast} = useToast();
  const {profile, profileIsLoading} = useProfile();
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {refreshSubscriptions: refreshUserSubscriptions} = useSubscriptions(profile);
  const [assigningSubscription, setAssigningSubscription] = useState<Subscription | null>(null);

  const topicsCountBySubscription = new Map<string, number>();
  topics.forEach(topic => {
    topic.subscriptions_ids.forEach(subscriptionId => {
      topicsCountBySubscription.set(
        subscriptionId,
        (topicsCountBySubscription.get(subscriptionId) ?? 0) + 1,
      );
    });
  });

  const handleAssign = (subscription: Subscription) => {
    flushSync(() => setAssigningSubscription(subscription));
    openModal(AssignTopicModalId);
  }

  const handleUnfollow = (subscription: Subscription) => {
    unfollowSubscription(subscription.uuid).then(() => {
      refreshSubscriptions();
      refreshUserSubscriptions();
      showToast(t("subscription_unfollowed"), subscription.name, () => {
        followSubscription(subscription.uuid).then(() => {
          refreshSubscriptions();
          refreshUserSubscriptions();
        });
      });
    });
  }

  return (
    <div className="w-full">
      {isLoading && (
        <FlexRow position={"center"}>
          <Spinner/>
          <span>{t("loading")}</span>
        </FlexRow>
      )}
      {!isLoading && subscriptions.length === 0 && (
        <div className={"flex flex-col items-center space-y-2"}>
          <InfoBanner>
            <span className="text-sm">{t("no_subscriptions_found")}</span>
          </InfoBanner>
        </div>
      )}
      {!isLoading && subscriptions.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(275px,1fr))] gap-4 justify-items-center">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.uuid}
              subscription={subscription}
              topicsCount={topicsCountBySubscription.get(subscription.uuid) ?? 0}
              onAssign={profile ? handleAssign : undefined}
              onUnfollow={profile ? handleUnfollow : undefined}
            />
          ))}
        </div>
      )}

      {assigningSubscription && (
        <AssignTopicModal
          topics={topics}
          subscription={assigningSubscription}
          refreshTopics={refreshTopics}
        />
      )}
    </div>
  );
};

export default CuratorSubscriptionsList;
