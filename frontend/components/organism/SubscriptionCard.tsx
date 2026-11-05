import React from "react";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Subscription} from "../../entities/Subscription";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import {PencilIcon} from "../atoms/Icons";
import EntityCard from "../molecules/EntityCard";
import FollowToggleButton from "../molecules/FollowToggleButton";

type SubscriptionCardProps = {
  subscription: Subscription;
  topicsCount: number;
  onAssign?: (subscription: Subscription) => void;
  onFollow?: (subscription: Subscription) => void;
  onUnfollow?: (subscription: Subscription) => void;
}

const SubscriptionCard = ({subscription, topicsCount, onAssign, onFollow, onUnfollow}: SubscriptionCardProps) => {
  const t = useTranslations("common");

  const canToggleFollow = subscription.followed ? onUnfollow !== undefined : onFollow !== undefined;

  return (
    <EntityCard
      href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
      title={subscription.name}
      media={<Avatar src={subscription.thumbnail} alt=""/>}
      corner={onAssign &&
          <Button primary={false} borderless={true} clickAction={() => onAssign(subscription)} tooltip={t("assign")}>
              <PencilIcon/>
          </Button>
      }
      footerStart={t("topics_count", {count: topicsCount})}
      footerEnd={canToggleFollow &&
          <FollowToggleButton followed={subscription.followed} isLoggedIn={true}
                              onFollow={() => onFollow?.(subscription)} onUnfollow={() => onUnfollow?.(subscription)}/>
      }
    />
  );
}

export default SubscriptionCard;
