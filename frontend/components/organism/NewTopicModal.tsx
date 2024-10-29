import React, {useState} from "react";
import {createTopic, followTopic, unfollowTopic} from "../../services/topicService";
import {v4 as uuidv4} from 'uuid';
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import Button from "../atoms/Button";
import InputText from "../atoms/InputText";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import {AddIcon, CheckCircleIcon, CircleIcon, MinusIcon} from "../atoms/Icons";
import Box from "../atoms/Box";
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
import Dropdown from "../atoms/Dropdown";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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
          {topic.followed && <Tag>Siguiendo</Tag>}
          {!topic.followed &&
              <Button clickAction={() => handleFollowTopic(topic.uuid)} disabled={topic.is_owner}>
                  <AddIcon/>
                  <span>{"Seguir"}</span>
              </Button>
          }
          {topic.followed &&
              <Button clickAction={() => handleUnfollowTopic(topic.uuid)} disabled={topic.is_owner}>
                  <MinusIcon/>
                  <span>{"Dejar de seguir"}</span>
              </Button>
          }
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

  const subscriptionsMenuItems = props.subscriptions
    .filter(subscription => subscription.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort(subscriptionSorting)
    .map(subscription => {
      const isSelected = subscriptionsToAdd.map(s => s.uuid).includes(subscription.uuid);
      const handleClick = () => {
        if (isSelected) {
          removeSubscription(subscription);
        } else {
          addSubscription(subscription);
        }
      }
      return <MenuItem key={subscription.uuid}
                       selected={false}
                       onClick={handleClick}>
        <FlexRow position={"start"}>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          {subscription.name}
          <FlexItem grow={true}/>
          {isSelected && <FlexItem><CheckCircleIcon/></FlexItem>}
          {!isSelected && <FlexItem><CircleIcon/></FlexItem>}
        </FlexRow>
      </MenuItem>
    })

  const subscriptionTags = subscriptionsToAdd
    .sort(subscriptionSorting)
    .map(subscription => {
      return (
        <Tag key={subscription.uuid}>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          {subscription.name}
        </Tag>)
    })

  return (
    <Modal id={NewTopicModalId}>
      <Tabs tabsText={tabsText} selectedTab={selectedTab} onTabSelected={setSelectedTab}/>
      {selectedTab === NEW_TOPIC_TAB &&
          <FlexColumn>
              <InputText placeholder="Introduce el nombre de la nueva categoría" value={newTopicName}
                         onChange={(value) => setNewTopicName(value)}/>
              <Box title={"Subscripciones (" + subscriptionsToAdd.length + ")"}>
                  <FlexRow wrap={true}>
                    {subscriptionTags.length === 0 &&
                        <span>{"No hay subscripciones"}</span>
                    }
                    {subscriptionTags.length > 0 &&
                      subscriptionTags
                    }
                  </FlexRow>
              </Box>
              <FlexRow hideOverflow={false} position={"between"}>
                  <Dropdown open={dropdownOpen} onChange={(open) => setDropdownOpen(open)}
                            start={true} bottom={false}
                            button={<FlexRow><span>Selecciona varias subscripciones</span></FlexRow>}>
                      <div className={"h-60"}>
                          <Menu>
                            {subscriptionsMenuItems.length === 0 &&
                                <MenuItem>{"No hay subscripciones"}</MenuItem>
                            }
                            {subscriptionsMenuItems.length > 0 && subscriptionsMenuItems}
                          </Menu>
                      </div>
                      <SearchBar value={searchValue} handleChange={(value) => setSearchValue(value)}/>
                  </Dropdown>
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
              <FlexItem grow={true}>
                  <SearchBar placeholder="Introduce una palabra para buscar categorías" value={topicSearch}
                             handleChange={setTopicSearch}/>
              </FlexItem>
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
                        <div className={"max-h-72 overflow-y-auto w-full"}>
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

export default NewTopicModal;
