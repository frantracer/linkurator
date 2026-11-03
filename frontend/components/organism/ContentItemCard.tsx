import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {SubscriptionItem} from "../../entities/SubscriptionItem";
import useAgoText from "../../hooks/useAgoText";
import {formatDuration} from "../../utilities/duration";
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
};

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
  label: string;
  children: React.ReactNode;
}

const ActionButton = ({active, onClick, label, children}: ActionButtonProps) => {
  const className = classNames(
    "btn btn-sm btn-circle border-0 shadow",
    {
      "bg-black/70 text-white hover:bg-black/90": !active,
      "bg-primary-filled": active,
    }
  );

  return (
    <button
      type="button"
      className={className}
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
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
  }: ContentItemCardProps) => {
  const {ref, inView} = useInView({threshold: 0, triggerOnce: true});
  const t = useTranslations("common");
  const router = useRouter();
  const {showToast, showErrorToast} = useToast();

  const [recommended, setRecommended] = useState(item.recommended);
  const [viewed, setViewed] = useState(item.viewed);
  const [discouraged, setDiscouraged] = useState(item.discouraged);
  const [hidden, setHidden] = useState(item.hidden);

  useEffect(() => setRecommended(item.recommended), [item.recommended]);
  useEffect(() => setViewed(item.viewed), [item.viewed]);
  useEffect(() => setDiscouraged(item.discouraged), [item.discouraged]);
  useEffect(() => setHidden(item.hidden), [item.hidden]);

  const agoText = useAgoText();

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>): void => {
    const {naturalWidth, naturalHeight} = event.currentTarget;
    // 120x90 is the default size of the thumbnail when the video for YouTube is not available
    if (addInvalidCard && item.subscription.provider === "youtube" &&
      naturalWidth === 120 && naturalHeight === 90) {
      addInvalidCard(item.uuid);
    }
  };

  // iOS standalone web apps can't open a new tab, so the item replaces the current page there
  const handleOpenItem = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const isIOS = /iPad|iPhone/.test(navigator.userAgent);
    if (isIOS) {
      event.preventDefault();
      window.location.href = item.url;
    }
  };

  // Optimistic: the UI flips at once and rolls back with a retryable error toast if saving fails
  const saveInteraction = (
    interactionType: InteractionType,
    previousValue: boolean,
    newValue: boolean,
    setActive: (active: boolean) => void,
    onSaved: () => void,
  ): Promise<void> => {
    setActive(newValue);
    return onChangeSwapButton(item.uuid, interactionType, newValue)
      .then(() => {
        onSaved();
        onChange?.();
      })
      .catch(() => {
        setActive(previousValue);
        showErrorToast(t("action_failed"), item.name, () => {
          saveInteraction(interactionType, previousValue, newValue, setActive, onSaved);
        });
      });
  };

  const toggleInteraction = (
    interactionType: InteractionType,
    isActive: boolean,
    setActive: (active: boolean) => void,
    markedMessage: string,
    unmarkedMessage: string
  ) => {
    const newValue = !isActive;
    const undo = () => saveInteraction(interactionType, newValue, isActive, setActive, () => {});
    return saveInteraction(interactionType, isActive, newValue, setActive, () => {
      showToast(newValue ? markedMessage : unmarkedMessage, item.name, undo);
    });
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

  // Podcast and feed artwork is usually square, so it is shown whole over a blurred copy instead of cropped
  const fitsWholeThumbnail = item.subscription.provider !== "youtube";

  if (!inView) {
    return (
      <div key="skeleton" ref={ref}>
        <ItemCardSkeleton/>
      </div>
    )
  }

  return (
    <article key="card" className="group flex flex-col gap-2 w-full min-w-0">
      <div className="relative">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenItem}
          tabIndex={-1}
          aria-hidden="true"
          className="relative block w-full aspect-video rounded-xl overflow-hidden bg-neutral"
        >
          {fitsWholeThumbnail &&
              <img src={item.thumbnail} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"/>
          }
          <img
            className={classNames("relative w-full h-full transition-opacity", {
              "object-cover": !fitsWholeThumbnail,
              "object-contain": fitsWholeThumbnail,
              "opacity-50": viewed,
            })}
            src={item.thumbnail}
            alt=""
            loading="lazy"
            onLoad={handleLoad}
          />
          {item.duration != undefined &&
              <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white text-xs font-medium">
                {formatDuration(item.duration)}
              </span>
          }
          {viewed && <span className="absolute inset-x-0 bottom-0 h-1 bg-primary"/>}
        </a>
        {withInteractions &&
            <div className={classNames(
              "absolute bottom-2 right-2 flex flex-row gap-1.5 transition-opacity",
              "lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100",
              {"lg:opacity-100": recommended || discouraged || hidden}
            )}>
                <ActionButton
                    active={recommended}
                    onClick={toggleRecommended}
                    label={recommended ? t("recommended") : t("mark_as_recommended")}>
                  {recommended ? <ThumbsUpFilledIcon/> : <ThumbsUpIcon/>}
                </ActionButton>
                <ActionButton
                    active={viewed}
                    onClick={toggleViewed}
                    label={viewed ? t("mark_as_not_viewed") : t("mark_as_viewed")}>
                  {viewed ? <CheckCircleFilledIcon/> : <CheckCircleIcon/>}
                </ActionButton>
                <Dropdown
                    width={"narrow"}
                    bottom={false}
                    position="end"
                    closeOnClickInside={true}
                    triggerStyle={"overlay"}
                    label={t("more_actions")}
                    button={<EllipsisHorizontalIcon/>}>
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
      <h3 className={classNames("text-sm font-semibold leading-snug line-clamp-2", {"text-base-content/60": viewed})}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={handleOpenItem}
           className="hover:text-primary" title={item.name}>
          {item.name}
        </a>
      </h3>
      <div className="flex flex-row items-center gap-2 text-xs text-base-content/70 min-w-0">
        {withSubscription &&
            <Link className="flex flex-row items-center gap-1.5 min-w-0 hover:text-primary"
                  href={paths.SUBSCRIPTIONS + "/" + item.subscription.uuid}>
                <Miniature src={item.subscription.thumbnail} alt=""
                           badgeImage={getProviderIcon(providers, item.subscription.provider)}/>
                <span className="truncate">{item.subscription.name}</span>
            </Link>
        }
        {withSubscription && <span aria-hidden="true">·</span>}
        <span className="flex-none whitespace-nowrap">{agoText(item.published_at)}</span>
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
    </article>
  )
};

export default ContentItemCard;
