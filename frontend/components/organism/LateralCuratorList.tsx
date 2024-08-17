import {MenuItem} from "../atoms/MenuItem";
import React from "react";
import {Curator} from "../../entities/Curators";
import {paths} from "../../configuration";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import FlexRow from "../atoms/FlexRow";
import Miniature from "../atoms/Miniature";

type LateralCuratorListProps = {
  curators: Curator[];
  selectedCurator: Curator | undefined;
  closeMenu: () => void;
}

const LateralCuratorList = (props: LateralCuratorListProps) => {
  const router = useRouter()
  const handleClick = (curatorId: string) => {
    const curator = props.curators.find((curator) => curator.id === curatorId);
    if (curator) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push(paths.CURATORS + "/" + curator.username)
    }
  }

  const items = props.curators
    .map((curator) => (
      <MenuItem
        key={curator.id}
        onClick={() => handleClick(curator.id)}
        selected={curator.id === props.selectedCurator?.id}
      >
        <FlexRow>
          <Miniature src={curator.avatar_url} alt={curator.username}/>
          <div className="whitespace-nowrap overflow-auto truncate w-full">{curator.username}</div>
        </FlexRow>
      </MenuItem>
    ))

  return (
    <Menu>
      {items}
    </Menu>
  )
}


export default LateralCuratorList;
