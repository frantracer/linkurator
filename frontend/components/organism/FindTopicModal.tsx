import { useRouter } from "next/navigation";
import { useState } from "react";
import { paths } from "../../configuration";
import { Topic } from "../../entities/Topic";
import { useDebounce } from "../../hooks/useDebounce";
import useFindTopics from "../../hooks/useFindTopics";
import useProfile from "../../hooks/useProfile";
import { followTopic, unfollowTopic } from "../../services/topicService";
import { closeModal } from "../../utilities/modalAction";
import Button from "../atoms/Button";
import Collapse from "../atoms/Collapse";
import { ErrorBanner } from "../atoms/ErrorBanner";
import FlexColumn from "../atoms/FlexColumn";
import FlexItem from "../atoms/FlexItem";
import FlexRow from "../atoms/FlexRow";
import { AddIcon, MinusIcon } from "../atoms/Icons";
import Menu from "../atoms/Menu";
import { MenuItem } from "../atoms/MenuItem";
import Miniature from "../atoms/Miniature";
import Modal from "../atoms/Modal";
import SearchBar from "../molecules/SearchBar";
import { useTranslations } from 'next-intl';
import Box from "../atoms/Box";

export const FindTopicModalId = "find-topic-modal";

type TopicsGroupedByCurator = {
  [curatorId: string]: Topic[];
};

type CuratorsIndexedById = {
  [curatorId: string]: {
    id: string;
    username: string;
    avatar_url: string;
    followed: boolean;
  };
};

type FindTopicModalProps = {
  refreshTopics: () => void;
}

const FindTopicModal = (props: FindTopicModalProps) => {
  const router = useRouter();
  const t = useTranslations("common");

  const {profile} = useProfile()

  const [topicSearch, setTopicSearch] = useState("");
  const debouncedTopicSearch = useDebounce(topicSearch, 500);

  const {topics, topicsAreLoading, refreshTopics} = useFindTopics(profile, debouncedTopicSearch);
  const topicsGroupedByCurator = topics.reduce((acc, topic) => {
    if (!acc[topic.curator.id]) {
      acc[topic.curator.id] = [];
    }
    acc[topic.curator.id].push(topic);
    return acc;
  }, {} as TopicsGroupedByCurator);
  const curatorsIndexedById = topics.reduce((acc, topic) => {
    acc[topic.curator.id] = topic.curator;
    return acc;
  }, {} as CuratorsIndexedById);

  const CollapsableMenuItems = Object.keys(topicsGroupedByCurator).map(curatorId => {
    const curator = curatorsIndexedById[curatorId];
    const titleElement = (
      <FlexRow position={"start"}>
        <Miniature src={curator.avatar_url} alt={curator.username}/>
        <span>{curator.username}</span>
      </FlexRow>
    );
    const contentElement = topicsGroupedByCurator[curatorId].map(topic =>
      <MenuItem key={topic.uuid} selected={false} onClick={() => handleClickCuratorTopic(topic.uuid)}>
        <FlexRow position={"start"}>
          <FlexItem grow={true}>
            <span>{topic.name}</span>
          </FlexItem>
          {!topic.followed &&
              <Button clickAction={() => handleFollowTopic(topic.uuid)} disabled={topic.is_owner}>
                  <AddIcon/>
                  <span>{t("follow")}</span>
              </Button>
          }
          {topic.followed &&
              <Button clickAction={() => handleUnfollowTopic(topic.uuid)} disabled={topic.is_owner}>
                  <MinusIcon/>
                  <span>{t("unfollow")}</span>
              </Button>
          }
        </FlexRow>
      </MenuItem>
    )

    return <Collapse title={titleElement} content={contentElement} key={curatorId} isOpen={true}/>
  });

  const handleFollowTopic = (topicId: string) => {
    followTopic(topicId).then(() => {
      refreshTopics();
      props.refreshTopics()
    });
  }

  const handleUnfollowTopic = (topicId: string) => {
    unfollowTopic(topicId).then(() => {
      refreshTopics();
      props.refreshTopics();
    });
  }

  const handleClickCuratorTopic = (topicId: string) => {
    router.push(paths.TOPICS + "/" + topicId);
    handleClose();
  }

  const handleClose = () => {
    setTopicSearch("");
    closeModal(FindTopicModalId);
  }

  return (
    <Modal id={FindTopicModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center">{t("find_topics")}</h1>
      <FlexColumn>
          <FlexItem grow={true}>
              <SearchBar placeholder={t("search_topic_placeholder")} value={topicSearch}
                         handleChange={setTopicSearch}/>
          </FlexItem>
          <Box title={t("topics")}>
              <div className={"h-72 overflow-y-auto"}>
                  <FlexColumn>
                    {debouncedTopicSearch === "" &&
                        <span>{t("search_topic_prompt")}</span>
                    }
                    {topics.length === 0 && !topicsAreLoading && debouncedTopicSearch !== "" &&
                        <ErrorBanner>{t("no_topics_found") + ": " + debouncedTopicSearch}</ErrorBanner>
                    }
                    {topicsAreLoading && <span>{t("loading")}</span>}
                    {topics.length > 0 &&
                        <div className={"max-h-72 overflow-y-auto w-full"}>
                            <Menu isFullHeight={true}>
                              {CollapsableMenuItems}
                            </Menu>
                        </div>
                    }
                  </FlexColumn>
              </div>
          </Box>
      </FlexColumn>
    </Modal>
  )
}

export default FindTopicModal;