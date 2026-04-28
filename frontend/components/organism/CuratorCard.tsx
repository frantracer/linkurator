import React from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {paths} from "../../configuration";
import {Curator} from "../../entities/Curators";
import Button from "../atoms/Button";
import {AddIcon, MinusIcon} from "../atoms/Icons";
import Miniature from "../atoms/Miniature";

type CuratorCardProps = {
  curator: Curator;
  onFollow?: (curator: Curator) => void;
  onUnfollow?: (curator: Curator) => void;
}

const CuratorCard = ({curator, onFollow, onUnfollow}: CuratorCardProps) => {
  const router = useRouter();
  const t = useTranslations("common");

  const handleCardClick = () => {
    router.push(paths.CURATORS + "/" + curator.username);
  }

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
      onClick={handleCardClick}
      className="card rounded-lg w-72 h-full bg-base-200 hover:scale-105 shadow-md border border-neutral hover:shadow-xl hover:border-primary duration-200 cursor-pointer"
    >
      <div className="card-body m-1 p-2 gap-3">
        <div className="flex flex-row items-center gap-2 min-w-0">
          <Miniature src={curator.avatar_url} alt={curator.username}/>
          <h3 className="card-title text-sm flex-1 hover:text-primary line-clamp-2">
            {curator.username}
          </h3>
        </div>
        {showActions && (
          <div className="card-actions flex justify-end mt-auto">
            {curator.followed ? (
              <Button
                primary={false}
                fitContent={true}
                clickAction={handleUnfollow}
                tooltip={t("unfollow")}
              >
                <MinusIcon/>
                {t("unfollow")}
              </Button>
            ) : (
              <Button
                primary={false}
                fitContent={true}
                clickAction={handleFollow}
                tooltip={t("follow")}
              >
                <AddIcon/>
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
