import React, {useState} from "react";
import {createTopic, followTopic, unfollowTopic} from "../../services/topicService";
import {v4 as uuidv4} from 'uuid';
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import {Subscription} from "../../entities/Subscription";
import Button from "../atoms/Button";
import InputText from "../atoms/InputText";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import {AddIcon, CrossIcon, MinusIcon} from "../atoms/Icons";
import Box from "../atoms/Box";
import Dropdown from "../atoms/Dropdown";
import FlexRow from "../atoms/FlexRow";
import FlexColumn from "../atoms/FlexColumn";
import {Tabs} from "../atoms/Tabs";
import SearchBar from "../molecules/SearchBar";
import Tag from "../atoms/Tag";
import Menu from "../atoms/Menu";
import {MenuItem} from "../atoms/MenuItem";
import {ErrorBanner} from "../atoms/ErrorBanner";
import {useDebounce} from "../../hooks/useDebounce";
import {useRouter} from "next/navigation";
import {paths} from "../../configuration";
import useFindTopics from "../../hooks/useFindTopics";
import useProfile from "../../hooks/useProfile";
import FlexItem from "../atoms/FlexItem";
import Miniature from "../atoms/Miniature";
import Collapse from "../atoms/Collapse";
import {Topic} from "../../entities/Topic";

const NEW_TOPIC_TAB = "Nueva categoría"
const FOLLOW_TOPIC_TAB = "Seguir categoría"

export const NewTopicModalId = "new-topic-modal";

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

type NewTopicModalProps = {
  subscriptions: Subscription[];
  refreshTopics: () => void;
}

const NewTopicModal = (props: NewTopicModalProps) => {
  const router = useRouter();

  const {profile} = useProfile()

  const tabsText = [NEW_TOPIC_TAB, FOLLOW_TOPIC_TAB];
  const [selectedTab, setSelectedTab] = useState(NEW_TOPIC_TAB);

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
          <FlexItem>
            <FlexRow>
              <span>{topic.name}</span>
              {topic.followed && <Tag>Siguiendo</Tag>}
            </FlexRow>
          </FlexItem>
          <FlexItem grow={true}/>
          <FlexItem>
            {!topic.followed &&
                <Button clickAction={() => handleFollowTopic(topic.uuid)} disabled={topic.is_owner} grow={false}>
                    <AddIcon/>
                    <span>{"Seguir"}</span>
                </Button>
            }
            {topic.followed &&
                <Button clickAction={() => handleUnfollowTopic(topic.uuid)} disabled={topic.is_owner} grow={false}>
                    <MinusIcon/>
                    <span>{"Dejar de seguir"}</span>
                </Button>
            }
          </FlexItem>
        </FlexRow>
      </MenuItem>
    )

    return <Collapse title={titleElement} content={contentElement} key={curatorId} isOpen={true}/>
  });

  const [newTopicName, setNewTopicName] = useState("");
  const {
    subscriptionsToAdd,
    addSubscription,
    removeSubscription,
    clearSubscriptions
  } = useSubscriptionsToAdd([], undefined)

  const subscriptionBadges = subscriptionsToAdd.map(s => subscriptionToBadge(s, removeSubscription));

  const onSubscriptionSelected = (subscriptionId: string) => {
    const subscription = props.subscriptions.find(subscription => subscription.uuid === subscriptionId);
    if (subscription && !subscriptionsToAdd.map(s => s.uuid).includes(subscription.uuid)) {
      addSubscription(subscription);
    }
  }

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
    closeModal(NewTopicModalId);
  }

  return (
    <Modal id={NewTopicModalId}>
      <Tabs tabsText={tabsText} selectedTab={selectedTab} onTabSelected={setSelectedTab}/>
      {selectedTab === NEW_TOPIC_TAB &&
          <FlexColumn>
              <InputText placeholder="Introduce el nombre de la nueva categoría" value={newTopicName}
                         onChange={(value) => setNewTopicName(value)}/>
              <Box title={"Subscripciones"}>
                  <FlexColumn>
                      <Dropdown title={"Selecciona varias subscripciones"} options={
                        props.subscriptions.map(subscription => {
                          return {key: subscription.uuid, label: subscription.name}
                        })
                      } onChange={(key) => onSubscriptionSelected(key)}/>
                      <FlexRow position={"start"} wrap={true}>
                        {subscriptionBadges}
                      </FlexRow>
                  </FlexColumn>
              </Box>
              <FlexRow position={"end"}>
                  <Button clickAction={async () => {
                    createTopic(uuidv4(), newTopicName, subscriptionsToAdd.map(s => s.uuid)).then(
                      () => {
                        setNewTopicName("");
                        props.refreshTopics();
                        clearSubscriptions();
                        closeModal(NewTopicModalId);
                      }
                    )
                  }}>
                      <span>{"Crear"}</span>
                  </Button>
              </FlexRow>
          </FlexColumn>
      }
      {selectedTab === FOLLOW_TOPIC_TAB &&
          <FlexColumn>
              <SearchBar placeholder="Introduce una palabra para buscar categorías" value={topicSearch}
                         handleChange={setTopicSearch}/>
              <Box title={"Categorías"}>
                  <FlexColumn>
                    {debouncedTopicSearch === "" &&
                        <span>{"Introduce una palabra para buscar categorías"}</span>
                    }
                    {topics.length === 0 && !topicsAreLoading && debouncedTopicSearch !== "" &&
                        <ErrorBanner>{"No se encontró nada relacionado con " + debouncedTopicSearch}</ErrorBanner>
                    }
                    {topicsAreLoading && <span>{"Cargando..."}</span>}
                    {topics.length > 0 &&
                        <div className={"max-h-72 overflow-y-auto"}>
                            <Menu isFullHeight={true}>
                              {CollapsableMenuItems}
                            </Menu>
                        </div>
                    }
                  </FlexColumn>
              </Box>
          </FlexColumn>}
    </Modal>
  )
}

function subscriptionToBadge(subscription: Subscription, removeSubscription: (subscription: Subscription) =>
  void) {
  return <Tag key={subscription.uuid}>
    <div className="flex flex-row gap-1">
      <div onClick={() => removeSubscription(subscription)} className="hover:cursor-pointer">
        <CrossIcon/>
      </div>
      {subscription.name}
    </div>
  </Tag>
}

export default NewTopicModal;
