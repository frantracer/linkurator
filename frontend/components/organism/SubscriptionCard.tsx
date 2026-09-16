import React from "react";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Subscription} from "../../entities/Subscription";
import ALink from "../atoms/ALink";
import Avatar from "../atoms/Avatar";
import Button from "../atoms/Button";
import CrossButton from "../atoms/CrossButton";
import {PencilIcon} from "../atoms/Icons";
import Tag from "../atoms/Tag";

type SubscriptionCardProps = {
  subscription: Subscription;
  topicsCount: number;
  onAssign?: (subscription: Subscription) => void;
  onUnfollow?: (subscription: Subscription) => void;
}

const SubscriptionCard = ({subscription, topicsCount, onAssign, onUnfollow}: SubscriptionCardProps) => {
  const t = useTranslations("common");

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

  return (
    <div
      className="card relative rounded-lg w-72 h-full bg-base-200 hover:scale-105 shadow-md border border-neutral hover:shadow-xl hover:border-primary duration-200 cursor-pointer"
    >
      <ALink href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}>
        <span className="absolute inset-0"/>
        <span className="sr-only">{subscription.name}</span>
      </ALink>
      <div className="card-body m-1 p-2 gap-3">
        <div className="flex flex-row items-start gap-3">
          <Avatar src={subscription.thumbnail} alt={subscription.name} size="lg"/>
          <h3 className="card-title text-sm flex-1 hover:text-primary line-clamp-2 pt-1">
            {subscription.name}
          </h3>
          {onAssign && (
            <div className="relative z-10 shrink-0">
              <Button
                primary={false}
                borderless={true}
                fitContent={true}
                clickAction={handleAssign}
                tooltip={t("assign")}
              >
                <PencilIcon/>
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-row items-center justify-between gap-2 mt-auto">
          <Tag>
            <span className="text-xs">
              {topicsCount} {t("topics").toLowerCase()}
            </span>
          </Tag>
          {subscription.followed && onUnfollow && (
            <div className="relative z-10">
              <Tag>
                <span className="text-xs">{t("following")}</span>
                <CrossButton onClick={handleUnfollow}/>
              </Tag>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubscriptionCard;
