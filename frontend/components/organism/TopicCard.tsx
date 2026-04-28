import React from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Topic} from "../../entities/Topic";
import Button from "../atoms/Button";
import {PencilIcon, StarFilledIcon, StarIcon, TrashIcon} from "../atoms/Icons";
import Miniature from "../atoms/Miniature";
import Tag from "../atoms/Tag";
import ALink from "../atoms/ALink";

type TopicCardProps = {
  topic: Topic;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topic: Topic) => void;
  onToggleFavorite: (topic: Topic) => void;
}

const TopicCard = ({topic, onEdit, onDelete, onToggleFavorite}: TopicCardProps) => {
  const router = useRouter();
  const t = useTranslations("common");

  const handleCardClick = () => {
    router.push(paths.TOPICS + "/" + topic.uuid);
  }

  const handleFavorite = () => {
    onToggleFavorite(topic);
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(topic);
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(topic);
    }
  }

  return (
    <div
      className="card rounded-lg w-60 h-full bg-base-200 hover:scale-105 shadow-md border border-neutral hover:shadow-xl hover:border-primary duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="card-body m-1 p-2 gap-3">
        <div className="flex flex-row items-center gap-1">
          <h2 className="card-title text-sm flex-1 hover:text-primary line-clamp-2">{topic.name}</h2>
          <Button
            primary={false}
            borderless={true}
            fitContent={true}
            clickAction={handleFavorite}
            tooltip={topic.is_favorite ? t("remove_from_favorites") : t("add_to_favorites")}
          >
            {topic.is_favorite ? <StarFilledIcon/> : <StarIcon/>}
          </Button>
        </div>
        {!topic.is_owner && (
          <div className="flex flex-row items-center gap-1 min-w-0 text-xs text-base-content/70">
            <ALink href={paths.CURATORS + "/" + topic.curator.username} onClick={(e) => e.stopPropagation()}>
              <div className={"flex flex-row items-center gap-1"}>
                <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
                <span className="truncate">{topic.curator.username}</span>
              </div>
            </ALink>
          </div>
        )}
        <div className="flex flex-row items-center justify-between gap-2 mt-auto">
          <Tag>
            <span className="text-xs">
              {topic.subscriptions_ids.length} {t("subscriptions").toLowerCase()}
            </span>
          </Tag>
          {topic.is_owner && (onEdit || onDelete) && (
            <div className="card-actions flex justify-end">
              {onDelete && (
                <Button primary={false} fitContent={true} clickAction={handleDelete} tooltip={t("delete")}>
                  <TrashIcon/>
                </Button>
              )}
              {onEdit && (
                <Button primary={false} fitContent={true} clickAction={handleEdit} tooltip={t("edit")}>
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

export default TopicCard;
