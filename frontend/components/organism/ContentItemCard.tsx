import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {readableAgoUnits} from "../../utilities/dateFormatter";
import {InteractionType, interactWithItem, removeInteractionWithItem,} from "../../services/interactionService";
import {paths} from "../../configuration";
import Link from "next/link";
import {useInView} from "react-intersection-observer";
import {
  ArchiveBoxFilledIcon,
  ArchiveBoxIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon
} from "../atoms/Icons";
import ItemCardSkeleton from "./ItemCardSkeleton";
import Miniature from "../atoms/Miniature";
import {getProviderIcon, Provider} from "../../entities/Provider";
import {useTranslations} from "next-intl";
import AvatarGroup from "../atoms/AvatarGroup";
import {useRouter} from "next/navigation";
import {useToast} from "../../contexts/ToastContext";
import Dropdown from "../atoms/Dropdown";
import {MenuItem} from "../atoms/MenuItem";

type ContentItemCardProps = {
  item: SubscriptionItem;
  providers: Provider[];
  addInvalidCard?: (uuid: string) => void;
  withSubscription?: boolean;
  withInteractions?: boolean;
  onChange?: () => void;
  onChangeSwapButton?: (itemUuid: string, interactionType: InteractionType, checked: boolean) => Promise<void>;
  limitTitleLength?: boolean;
};

const convert_seconds_to_hh_mm_ss = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - (hours * 3600)) / 60);
  const seconds_left = seconds - (hours * 3600) - (minutes * 60);
  let result = "";
  if (hours > 0) {
    result += hours.toString() + ":";
    result += minutes.toString().padStart(2, "0") + ":";
  } else {
    result += minutes.toString() + ":";
  }
  result += seconds_left.toString().padStart(2, "0");
  return result;
}

async function defaultOnChangeSwapButton(itemUuid: string, interactionType: InteractionType, checked: boolean) {
  if (checked) {
    await interactWithItem(itemUuid, interactionType);
  } else {
    await removeInteractionWithItem(itemUuid, interactionType);
  }
}

type ActionButtonProps = {
  active: boolean;
  onClick: () => void;
  tooltip: string;
  children: React.ReactNode;
}

const ActionButton = ({active, onClick, tooltip, children}: ActionButtonProps) => {
  const className = classNames(
    "btn btn-sm btn-outline flex-1 flex-nowrap gap-1 px-2 rounded-md font-normal text-xs",
    "hover:!bg-base-300 hover:!border-primary hover:!text-primary",
    {
      "border-neutral text-base-content": !active,
      "border-primary text-primary": active,
    }
  );

  return (
    <button
      type="button"
      className={className}
      title={tooltip}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        e.currentTarget.blur();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

const ContentItemCard = (
  {
    item,
    providers,
    addInvalidCard = undefined,
    withSubscription = true,
    withInteractions = true,
    onChange = undefined,
    onChangeSwapButton = defaultOnChangeSwapButton,
    limitTitleLength = false
  }: ContentItemCardProps) => {
  const {ref, inView} = useInView({threshold: 0, triggerOnce: true});
  const t = useTranslations("common");
  const router = useRouter();
  const {showToast} = useToast();

  const [recommended, setRecommended] = useState(item.recommended);
  const [viewed, setViewed] = useState(item.viewed);
  const [discouraged, setDiscouraged] = useState(item.discouraged);
  const [hidden, setHidden] = useState(item.hidden);

  useEffect(() => setRecommended(item.recommended), [item.recommended]);
  useEffect(() => setViewed(item.viewed), [item.viewed]);
  useEffect(() => setDiscouraged(item.discouraged), [item.discouraged]);
  useEffect(() => setHidden(item.hidden), [item.hidden]);

  const convertPublishedToAgoText = (date: Date) => {
    const ago = readableAgoUnits(date);
    return t("ago_label", {value: ago.value, unit: t(ago.unit)});
  }

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const {naturalWidth, naturalHeight} = event.currentTarget;
    // 120x90 is the default size of the thumbnail when the video for YouTube is not available
    if (addInvalidCard && item.subscription.provider === "youtube" &&
      naturalWidth === 120 && naturalHeight === 90) {
      addInvalidCard(item.uuid);
    }
  };

  const handleOpenItem = (itemUrl: string) => {
    const isIOS = /iPad|iPhone/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = itemUrl;
    } else {
      window.open(itemUrl, "_blank");
    }
  };

  const toggleInteraction = (
    interactionType: InteractionType,
    isActive: boolean,
    setActive: (active: boolean) => void,
    markedMessage: string,
    unmarkedMessage: string
  ) => {
    const newValue = !isActive;
    setActive(newValue);
    showToast(
      newValue ? markedMessage : unmarkedMessage,
      item.name,
      () => {
        setActive(isActive);
        onChangeSwapButton(item.uuid, interactionType, isActive).then(onChange);
      }
    );
    return onChangeSwapButton(item.uuid, interactionType, newValue).then(onChange);
  };

  const toggleRecommended = () => toggleInteraction(
    InteractionType.Recommended, recommended, setRecommended,
    t("action_marked_as_recommended"), t("action_unmarked_as_recommended"));

  const toggleViewed = () => toggleInteraction(
    InteractionType.Viewed, viewed, setViewed,
    t("action_marked_as_viewed"), t("action_marked_as_not_viewed"));

  const toggleDiscouraged = () => toggleInteraction(
    InteractionType.Discouraged, discouraged, setDiscouraged,
    t("action_marked_as_not_recommended"), t("action_unmarked_as_not_recommended"));

  const toggleHidden = () => toggleInteraction(
    InteractionType.Hidden, hidden, setHidden,
    t("action_marked_as_archived"), t("action_marked_as_not_archived"));

  if (!inView) {
    return (
      <div key="skeleton" ref={ref}>
        <ItemCardSkeleton/>
      </div>
    )
  } else {
    return (
      <div
        key="card"
        className={classNames(
          "card card-compact rounded-lg w-80 bg-base-200 hover:scale-105 shadow-md hover:shadow-xl duration-200",
          "after:absolute after:inset-0 after:rounded-lg after:border after:border-neutral after:pointer-events-none",
          "hover:after:border-primary after:transition-colors after:duration-200"
        )}>
        <figure className="aspect-video h-48 rounded-t-lg">
          <img className="h-full hover:cursor-pointer"
               src={item.thumbnail}
               alt={item.name}
               onClick={() => handleOpenItem(item.url)}
               onLoad={handleLoad}
          />
          {item.duration != undefined &&
              <span className="absolute top-0 right-0 m-1 p-1 bg-black bg-opacity-90 rounded">
                <p className="text-white">{convert_seconds_to_hh_mm_ss(item.duration)}</p>
            </span>
          }
        </figure>
        <div className="card-body">
          <h2
            className={`card-title text-sm cursor-pointer hover:text-primary ${limitTitleLength ? 'line-clamp-2' : ''}`}
            onClick={() => handleOpenItem(item.url)}
            title={limitTitleLength ? item.name : undefined}>
            {item.name}
          </h2>
          <div className="flex text-xs gap-x-2 items-center text-base-content/70">
            {withSubscription &&
                <div className="flex flex-1 min-w-0 gap-x-1 items-center cursor-pointer hover:text-primary">
                    <Miniature src={getProviderIcon(providers, item.subscription.provider)}
                               alt={item.subscription.provider}/>
                    <Miniature src={item.subscription.thumbnail} alt={item.subscription.name}/>
                    <Link className="min-w-0 break-words" href={paths.SUBSCRIPTIONS + "/" + item.subscription.uuid}>
                      {item.subscription.name}
                    </Link>
                </div>
            }
            <p className="flex-none ml-auto whitespace-nowrap">{convertPublishedToAgoText(item.published_at)}</p>
          </div>
          {item.recommended_by && item.recommended_by.length > 0 &&
              <div className="flex gap-x-2 items-center">
                  <span className="text-xs text-base-content/70">{t("recommended_by")}:</span>
                  <AvatarGroup users={item.recommended_by.map(
                    ({curator}) => ({
                      id: curator.id, username: curator.username, avatarUrl: curator.avatar_url, onClick: () => {
                        router.push(paths.CURATORS + "/" + curator.username);
                      }
                    })
                  )} maxDisplay={3}/>
              </div>
          }
          {withInteractions &&
              <div className="card-actions flex flex-row flex-nowrap gap-2 mt-3">
                  <ActionButton
                      active={recommended}
                      onClick={toggleRecommended}
                      tooltip={recommended ? t("not_recommended") : t("mark_as_recommended")}>
                    {recommended ? <ThumbsUpFilledIcon/> : <ThumbsUpIcon/>}
                    {recommended ? t("recommended") : t("recommend")}
                  </ActionButton>
                  <ActionButton
                      active={viewed}
                      onClick={toggleViewed}
                      tooltip={viewed ? t("mark_as_not_viewed") : t("mark_as_viewed")}>
                    {viewed ? <CheckCircleFilledIcon/> : <CheckCircleIcon/>}
                    {viewed ? t("viewed") : t("mark_viewed")}
                  </ActionButton>
                  <Dropdown
                      small={true}
                      bottom={false}
                      position="end"
                      closeOnClickInside={true}
                      button={
                        <span
                          className={classNames(
                            "btn btn-sm btn-outline px-2 rounded-md",
                            "hover:!bg-base-300 hover:!border-primary hover:!text-primary",
                            {
                              "border-neutral text-base-content": !discouraged && !hidden,
                              "border-primary text-primary": discouraged || hidden,
                            }
                          )}
                          title={t("more_actions")}
                          aria-label={t("more_actions")}>
                          <EllipsisHorizontalIcon/>
                        </span>
                      }>
                      <li>
                          <MenuItem onClick={toggleDiscouraged} selected={discouraged}>
                              <span className="flex items-center gap-2">
                                {discouraged ? <ThumbsDownFilledIcon/> : <ThumbsDownIcon/>}
                                {discouraged ? t("not_recommended") : t("dont_recommend")}
                              </span>
                          </MenuItem>
                      </li>
                      <li>
                          <MenuItem onClick={toggleHidden} selected={hidden}>
                              <span className="flex items-center gap-2">
                                {hidden ? <ArchiveBoxFilledIcon/> : <ArchiveBoxIcon/>}
                                {hidden ? t("unarchive") : t("archive")}
                              </span>
                          </MenuItem>
                      </li>
                  </Dropdown>
              </div>
          }
        </div>
      </div>
    )
  }
};

export default ContentItemCard;
