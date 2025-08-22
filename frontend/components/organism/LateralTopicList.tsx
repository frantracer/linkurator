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
import Collapse from "../atoms/Collapse";
import React from "react";
import Button from "../atoms/Button";
import {AddIcon} from "../atoms/Icons";

type LateralTopicListProps = {
  topics: Topic[];
  selectedTopic: Topic | undefined;
  closeMenu: () => void;
  openCreateTopicModal: () => void;
}

const LateralTopicList = (props: LateralTopicListProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const isArenaSectionOpen = {
    favorites: true,
    myTopics: true,
    otherTopics: true
  };

  const handleClick = (topicId: string) => {
    const topic = props.topics.find((topic) => topic.uuid === topicId);
    if (topic) {
      props.closeMenu();
      scrollToDrawerTop()
      router.push(paths.TOPICS + "/" + topic.uuid)
    }
  }

  // Group topics into categories
  const favoriteTopics = props.topics.filter(topic => topic.is_favorite);
  const myTopics = props.topics.filter(topic => topic.is_owner && !topic.is_favorite);
  const otherTopics = props.topics.filter(topic => !topic.is_owner && !topic.is_favorite);

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

  const renderSection = (title: string, topics: Topic[], sectionKey: keyof typeof isArenaSectionOpen) => {
    if (topics.length === 0) return null;

    return (
      <Collapse
        key={title}
        isOpen={isArenaSectionOpen[sectionKey]}
        title={
          <span className="text-sm font-semibold text-base-content/70 uppercase tracking-wide">
            {title} ({topics.length})
          </span>
        }
        content={
          <div className="space-y-1">
            {topics.map(renderTopicItem)}
          </div>
        }
      />
    );
  };

  const noItems = (
    <div className="flex flex-col items-center h-fit gap-2 p-1">
    <Button fitContent={false} clickAction={props.openCreateTopicModal}>
      <AddIcon/>
      {t("create_topic")}
    </Button>
    <InfoBanner>
      <span className={"text-sm"}>{t("no_topics_found")}</span>
    </InfoBanner>
    </div>
  )

  const sections = [
    renderSection(t("favorites"), favoriteTopics, "favorites"),
    renderSection(t("my_topics"), myTopics, "myTopics"),
    renderSection(t("other_topics"), otherTopics, "otherTopics")
  ].filter(s => s !== null);

  return (
    <Menu>
      {sections.length > 0 ? sections : noItems}
    </Menu>
  )
}

export default LateralTopicList;
