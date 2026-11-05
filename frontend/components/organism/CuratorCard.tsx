import React from "react";
import {paths} from "../../configuration";
import {Curator} from "../../entities/Curators";
import Avatar from "../atoms/Avatar";
import EntityCard from "../molecules/EntityCard";
import FollowToggleButton from "../molecules/FollowToggleButton";

type CuratorCardProps = {
  curator: Curator;
  onFollow?: (curator: Curator) => void;
  onUnfollow?: (curator: Curator) => void;
}

const CuratorCard = ({curator, onFollow, onUnfollow}: CuratorCardProps) => {
  const canToggleFollow = curator.followed ? onUnfollow !== undefined : onFollow !== undefined;

  return (
    <EntityCard
      href={paths.CURATORS + "/" + curator.username}
      title={curator.username}
      media={<Avatar src={curator.avatar_url} alt=""/>}
      footerEnd={canToggleFollow &&
          <FollowToggleButton followed={curator.followed} isLoggedIn={true}
                              onFollow={() => onFollow?.(curator)} onUnfollow={() => onUnfollow?.(curator)}/>
      }
    />
  );
}

export default CuratorCard;
