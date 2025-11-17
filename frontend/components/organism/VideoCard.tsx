import {SubscriptionItem} from "../../entities/SubscriptionItem";
import {readableAgoUnits} from "../../utilities/dateFormatter";
import {InteractionType, interactWithItem, removeInteractionWithItem,} from "../../services/interactionService";
import {paths} from "../../configuration";
import Link from "next/link";
import {useInView} from "react-intersection-observer";
import {SwapButton} from "../atoms/SwapButton";
import {
  ArchiveBoxFilledIcon,
  ArchiveBoxIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon
} from "../atoms/Icons";
import ItemCardSkeleton from "./ItemCardSkeleton";
import Miniature from "../atoms/Miniature";
import {providerIconUrl} from "../../entities/Subscription";
import {useTranslations} from "next-intl";
import AvatarGroup from "../atoms/AvatarGroup";
import {useRouter} from "next/navigation";

type VideoCardProps = {
  item: SubscriptionItem;
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

const VideoCard = (
  {
    item,
    addInvalidCard = undefined,
    withSubscription = true,
    withInteractions = true,
    onChange = undefined,
    onChangeSwapButton = defaultOnChangeSwapButton,
    limitTitleLength = false
  }: VideoCardProps) => {
  const {ref, inView} = useInView({threshold: 0});
  const t = useTranslations("common");
  const router = useRouter()

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
    console.log(navigator.userAgent);
    const isIOS = /iPad|iPhone/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = itemUrl;
    } else {
      window.open(itemUrl, "_blank");
    }
  };

  if (!inView) {
    return (
      <div ref={ref}>
        <ItemCardSkeleton/>
      </div>
    )
  } else {
    return (
      <div
        className="card card-compact rounded-lg w-80 bg-base-200 hover:scale-105 shadow-md border border-base-300 hover:shadow-xl hover:border-primary duration-200">
        <figure className="aspect-video h-48">
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
        <div className="card-body m-1">
          <h2
            className={`card-title text-sm cursor-pointer hover:text-primary ${limitTitleLength ? 'line-clamp-2' : ''}`}
            onClick={() => handleOpenItem(item.url)}
            title={limitTitleLength ? item.name : undefined}>
            {item.name}
          </h2>
          {withSubscription &&
              <div className="flex text-xs gap-x-2 items-center cursor-pointer hover:text-primary text-base-content/70">
                  <Miniature src={providerIconUrl(item.subscription.provider)} alt={item.subscription.provider}/>
                  <Miniature src={item.subscription.thumbnail} alt={item.subscription.name}/>
                  <Link href={paths.SUBSCRIPTIONS + "/" + item.subscription.uuid}>{item.subscription.name}</Link>
              </div>
          }
          {item.recommended_by && item.recommended_by.length > 0 &&
              <div className="flex gap-x-2 items-center">
                  <span className="text-xs text-base-content/70">{t("recommended_by")}:</span>
                  <AvatarGroup users={item.recommended_by.map(
                    curator => ({
                      id: curator.id, username: curator.username, avatarUrl: curator.avatar_url, onClick: () => {
                        router.push(paths.CURATORS + "/" + curator.username);
                      }
                    })
                  )} maxDisplay={3}/>
              </div>
          }
          <div className="flex flex-row">
            <div className={"flex flex-grow"}>
              <p className={"text-xs text-base-content/70 self-end"}>{convertPublishedToAgoText(item.published_at)}</p>
            </div>
            {withInteractions &&
                <div className="card-actions flex justify-end">
                    <div className={"hover:text-primary"}>
                        <SwapButton
                            defaultChecked={item.discouraged}
                            onChange={
                              (isChecked) => onChangeSwapButton &&
                                onChangeSwapButton(item.uuid, InteractionType.Discouraged, isChecked).then(onChange)
                            }
                            tooltip={item.discouraged ? t("mark_as_not_recommended") : t("mark_as_not_recommended")}>
                            <ThumbsDownFilledIcon/>
                            <ThumbsDownIcon/>
                        </SwapButton>
                    </div>
                    <div className={"hover:text-primary"}>
                        <SwapButton
                            defaultChecked={item.recommended}
                            onChange={
                              (isChecked) => onChangeSwapButton &&
                                onChangeSwapButton(item.uuid, InteractionType.Recommended, isChecked).then(onChange)
                            }
                            tooltip={item.recommended ? t("not_recommended") : t("mark_as_recommended")}>
                            <ThumbsUpFilledIcon/>
                            <ThumbsUpIcon/>
                        </SwapButton>
                    </div>
                    <div className={"hover:text-primary"}>
                        <SwapButton
                            defaultChecked={item.hidden}
                            onChange={(isChecked) => onChangeSwapButton &&
                              onChangeSwapButton(item.uuid, InteractionType.Hidden, isChecked).then(onChange)}
                            tooltip={item.hidden ? t("mark_as_not_archived") : t("mark_as_archived")}>
                            <ArchiveBoxFilledIcon/>
                            <ArchiveBoxIcon/>
                        </SwapButton>
                    </div>
                    <div className={"hover:text-primary"}>
                        <SwapButton
                            defaultChecked={item.viewed}
                            onChange={(isChecked) => onChangeSwapButton &&
                              onChangeSwapButton(item.uuid, InteractionType.Viewed, isChecked).then(onChange)}
                            tooltip={item.viewed ? t("mark_as_not_viewed") : t("mark_as_viewed")}>
                            <CheckCircleFilledIcon/>
                            <CheckCircleIcon/>
                        </SwapButton>
                    </div>
                </div>
            }
          </div>
        </div>
      </div>
    )
  }
};

export default VideoCard;
