import {MenuItem} from "../atoms/MenuItem";
import React from "react";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import FlexRow from "../atoms/FlexRow";
import Miniature from "../atoms/Miniature";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexItem from "../atoms/FlexItem";
import {useTranslations} from "next-intl"; // Add this line

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  closeMenu: () => void;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const t = useTranslations("common"); // Add this line
  const router = useRouter()
  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push(paths.TOPICS + "/" + topic.uuid)
    }
  }

  const items = props.topics
    .map((topic) => (
      <MenuItem
        key={topic.uuid}
        onClick={() => handleClick(topic.uuid)}
        selected={topic.uuid === props.selectedTopic?.uuid}
      >
        <FlexRow position={"start"}>
          <span className={"text-wrap"}>{topic.name}</span>
          <FlexItem grow={true}/>
          {!topic.is_owner &&
              <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
          }
        </FlexRow>
      </MenuItem>
    ))

  const noItems = (
    <InfoBanner>
      <span className={"text-sm"}>{t("no_topics_found")}</span>
    </InfoBanner>
  )

  return (
    <Menu>
      {items.length > 0 ? items : noItems}
    </Menu>
  )
}

export default LateralTopicList;
