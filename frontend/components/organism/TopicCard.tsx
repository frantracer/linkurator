import React from "react";
import Link from "next/link";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Topic} from "../../entities/Topic";
import Button from "../atoms/Button";
import {PencilIcon, StarFilledIcon, StarIcon, TrashIcon} from "../atoms/Icons";
import Miniature from "../atoms/Miniature";
import TopicIcon from "../atoms/TopicIcon";
import EntityCard from "../molecules/EntityCard";
import FollowToggleButton from "../molecules/FollowToggleButton";

type TopicCardProps = {
  topic: Topic;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
  onToggleFavorite: (topic: Topic) => void;
  onFollow?: (topic: Topic) => void;
  onUnfollow?: (topic: Topic) => void;
}

const TopicCard = ({topic, onEdit, onDelete, onToggleFavorite, onFollow, onUnfollow}: TopicCardProps) => {
  const t = useTranslations("common");

  const canToggleFollow = topic.followed ? onUnfollow !== undefined : onFollow !== undefined;

  return (
    <EntityCard
      href={paths.TOPICS + "/" + topic.uuid}
      title={topic.name}
      media={<TopicIcon name={topic.name} size={"md"}/>}
      meta={!topic.is_owner &&
          <Link href={paths.CURATORS + "/" + topic.curator.username}
                className="inline-flex flex-row items-center gap-1 min-w-0 hover:text-primary">
              <Miniature src={topic.curator.avatar_url} alt=""/>
              <span className="truncate">{topic.curator.username}</span>
          </Link>
      }
      corner={
        <Button primary={false} borderless={true} ariaPressed={topic.is_favorite}
                clickAction={() => onToggleFavorite(topic)}
                tooltip={topic.is_favorite ? t("remove_from_favorites") : t("add_to_favorites")}>
          {topic.is_favorite ? <StarFilledIcon/> : <StarIcon/>}
        </Button>
      }
      footerStart={t("subscriptions_count", {count: topic.subscriptions_ids.length})}
      footerEnd={<>
        {topic.is_owner && onDelete &&
            <Button primary={false} borderless={true} clickAction={() => onDelete(topic)} tooltip={t("delete")}>
                <TrashIcon/>
            </Button>
        }
        {topic.is_owner && onEdit &&
            <Button primary={false} borderless={true} clickAction={() => onEdit(topic)} tooltip={t("edit")}>
                <PencilIcon/>
            </Button>
        }
        {!topic.is_owner && canToggleFollow &&
            <FollowToggleButton followed={topic.followed} isLoggedIn={true}
                                onFollow={() => onFollow?.(topic)} onUnfollow={() => onUnfollow?.(topic)}/>
        }
      </>}
    />
  );
}

export default TopicCard;
