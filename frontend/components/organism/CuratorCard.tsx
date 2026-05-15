import React from "react";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Curator} from "../../entities/Curators";
import ALink from "../atoms/ALink";
import Button from "../atoms/Button";
import CrossButton from "../atoms/CrossButton";
import Miniature from "../atoms/Miniature";
import Tag from "../atoms/Tag";

type CuratorCardProps = {
  curator: Curator;
  onFollow?: (curator: Curator) => void;
  onUnfollow?: (curator: Curator) => void;
}

const CuratorCard = ({curator, onFollow, onUnfollow}: CuratorCardProps) => {
  const t = useTranslations("common");

  const handleFollow = () => {
    if (onFollow) {
      onFollow(curator);
    }
  }

  const handleUnfollow = () => {
    if (onUnfollow) {
      onUnfollow(curator);
    }
  }

  const showActions = (curator.followed && onUnfollow) || (!curator.followed && onFollow);

  return (
    <div
      className="card relative rounded-lg w-72 h-full bg-base-200 hover:scale-105 shadow-md border border-neutral hover:shadow-xl hover:border-primary duration-200 cursor-pointer"
    >
      <ALink href={paths.CURATORS + "/" + curator.username}>
        <span className="absolute inset-0"/>
        <span className="sr-only">{curator.username}</span>
      </ALink>
      <div className="card-body m-1 p-2 gap-3">
        <div className="flex flex-row items-center gap-2 min-w-0">
          <Miniature src={curator.avatar_url} alt={curator.username}/>
          <h3 className="card-title text-sm flex-1 hover:text-primary line-clamp-2">
            {curator.username}
          </h3>
        </div>
        {showActions && (
          <div className="card-actions flex justify-end mt-auto relative z-10">
            {curator.followed ? (
              <Tag>
                <span className="text-xs">{t("following")}</span>
                <CrossButton onClick={handleUnfollow}/>
              </Tag>
            ) : (
              <Button
                primary={true}
                fitContent={true}
                clickAction={handleFollow}
              >
                {t("follow")}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CuratorCard;
