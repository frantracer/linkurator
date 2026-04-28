import React from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Subscription} from "../../entities/Subscription";
import Button from "../atoms/Button";
import {MinusIcon, PencilIcon} from "../atoms/Icons";
import Miniature from "../atoms/Miniature";
import Tag from "../atoms/Tag";

type SubscriptionCardProps = {
  subscription: Subscription;
  topicsCount: number;
  onAssign?: (subscription: Subscription) => void;
  onUnfollow?: (subscription: Subscription) => void;
}

const SubscriptionCard = ({subscription, topicsCount, onAssign, onUnfollow}: SubscriptionCardProps) => {
  const router = useRouter();
  const t = useTranslations("common");

  const handleCardClick = () => {
    router.push(paths.SUBSCRIPTIONS + "/" + subscription.uuid);
  }

  const handleAssign = () => {
    if (onAssign) {
      onAssign(subscription);
    }
  }

  const handleUnfollow = () => {
    if (onUnfollow) {
      onUnfollow(subscription);
    }
  }

  const showActions = onAssign || (subscription.followed && onUnfollow);

  return (
    <div
      onClick={handleCardClick}
      className="card rounded-lg w-72 h-full bg-base-200 hover:scale-105 shadow-md border border-neutral hover:shadow-xl hover:border-primary duration-200 cursor-pointer"
    >
      <div className="card-body m-1 p-2 gap-3">
        <div className="flex flex-row items-center gap-2 min-w-0">
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <h3 className="card-title text-sm flex-1 hover:text-primary line-clamp-2">
            {subscription.name}
          </h3>
        </div>
        <div className="flex flex-row items-center justify-between gap-2 mt-auto">
          <Tag>
            <span className="text-xs">
              {topicsCount} {t("topics").toLowerCase()}
            </span>
          </Tag>
          {showActions && (
            <div className="card-actions flex justify-end gap-1">
              {subscription.followed && onUnfollow && (
                <Button
                  primary={false}
                  fitContent={true}
                  clickAction={handleUnfollow}
                  tooltip={t("unfollow")}
                >
                  <MinusIcon/>
                </Button>
              )}
              {onAssign && (
                <Button
                  primary={false}
                  fitContent={true}
                  clickAction={handleAssign}
                  tooltip={t("assign")}
                >
                  <PencilIcon/>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCard;
