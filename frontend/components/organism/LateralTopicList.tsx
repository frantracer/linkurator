import {MenuItem} from "../atoms/MenuItem";
import {Topic} from "../../entities/Topic";
import {paths} from "../../configuration";
import {useRouter} from "next/navigation";
import {scrollToDrawerTop} from "../../utilities/scrollToDrawerTop";
import Menu from "../atoms/Menu";
import FlexRow from "../atoms/FlexRow";
import Miniature from "../atoms/Miniature";
import {InfoBanner} from "../atoms/InfoBanner";
import FlexItem from "../atoms/FlexItem";
import {useTranslations} from "next-intl";
import React from "react";

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  isLoading: boolean;
  closeMenu: () => void;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const t = useTranslations("common");
  const router = useRouter();

  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push(paths.TOPICS + "/" + topic.uuid)
    }
  }

  const favoriteTopics = props.topics.filter(topic => topic.is_favorite);

  const renderTopicItem = (topic: Topic) => (
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
  );

  const noItems = (
    <div className="flex flex-col items-center h-fit gap-2 p-1">
      <InfoBanner>
        <span className={"text-sm"}>{t("no_topics_found")}</span>
      </InfoBanner>
    </div>
  )

  return (
    <Menu>
      {favoriteTopics.length > 0 &&
          <div className="space-y-1">
            {favoriteTopics.map(renderTopicItem)}
          </div>
      }
      {favoriteTopics.length === 0 && !props.isLoading && noItems}
    </Menu>
  )
}

export default LateralTopicList;
