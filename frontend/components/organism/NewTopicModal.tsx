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
import Avatar from "../atoms/Avatar";
import Divider from "../atoms/Divider";
import Menu from "../atoms/Menu";
import {MenuItem} from "../atoms/MenuItem";
import {useCurator} from "../../hooks/useCurator";
import {useCuratorTopics} from "../../hooks/useCuratorTopics";
import {ErrorBanner} from "../atoms/ErrorBanner";
import {useDebounce} from "../../hooks/useDebounce";
import {useRouter} from "next/navigation";
import {paths} from "../../configuration";
import {topicSorting} from "../../entities/Topic";

const NEW_TOPIC_TAB = "Nueva categoría"
const FOLLOW_TOPIC_TAB = "Seguir categoría"

export const NewTopicModalId = "new-topic-modal";

type NewTopicModalProps = {
  subscriptions: Subscription[];
  refreshTopics: () => void;
}

const NewTopicModal = (props: NewTopicModalProps) => {
  const router = useRouter();

  const tabsText = [NEW_TOPIC_TAB, FOLLOW_TOPIC_TAB];
  const [selectedTab, setSelectedTab] = useState(NEW_TOPIC_TAB);

  const [curatorSearch, setCuratorSearch] = useState("");
  const debouncedCuratorSearch = useDebounce(curatorSearch, 500);

  const {
    curator,
    curatorIsLoading
  } = useCurator(debouncedCuratorSearch);
  const {
    topics: curatorTopics,
    topicsIsLoading: curatorTopicsIsLoading,
    refetchTopics: refreshCuratorTopics
  } = useCuratorTopics(curator === null ? null : curator.id);

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
      refreshCuratorTopics().then(() => {
        props.refreshTopics();
      });
    });
  }

  const handleUnfollowTopic = (topicId: string) => {
    unfollowTopic(topicId).then(() => {
      refreshCuratorTopics().then(() => {
        props.refreshTopics();
      });
    });
  }

  const handleClickCuratorTopic = (topicId: string) => {
    router.push(paths.TOPICS + "/" + topicId);
    closeModal(NewTopicModalId);
  }

  return (
    <Modal id={NewTopicModalId}>
      <Tabs tabsText={tabsText} selectedTab={selectedTab} onTabSelected={setSelectedTab}/>
      <Divider/>
      {selectedTab === NEW_TOPIC_TAB &&
          <FlexColumn>
              <h1 className="font-bold text-xl w-full text-center">{"Crear nueva categoría"}</h1>
              <InputText placeholder="Nombre de la nueva categoría" value={newTopicName}
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
              <h1 className="font-bold text-xl w-full text-center">{"Seguir categoría"}</h1>
              <SearchBar placeholder="Buscar curador de contenido" value={curatorSearch}
                         handleChange={setCuratorSearch}/>
              <Box title={"Curador"}>
                  <FlexColumn>
                    {debouncedCuratorSearch !== "" && curator === null && !curatorIsLoading &&
                        <ErrorBanner>{"No se encontró el curador " + debouncedCuratorSearch}</ErrorBanner>
                    }
                    {curatorIsLoading && <span>{"Cargando..."}</span>}
                    {curator !== null &&
                        <FlexRow>
                            <Avatar src={curator.avatar_url} alt={curator.username}/>
                            <span>{curator.username}</span>
                        </FlexRow>
                    }
                    {curatorTopicsIsLoading && <span>{"Cargando categorías..."}</span>}
                    {curatorTopics &&
                        <div className={"max-h-48 overflow-y-auto"}>
                            <Menu isFullHeight={true}>
                              {curatorTopics.sort(topicSorting).map(topic =>
                                <MenuItem key={topic.uuid} selected={false} onClick={
                                  () => {
                                    handleClickCuratorTopic(topic.uuid)
                                  }}>
                                  <FlexRow position={"between"}>
                                    <FlexRow position={"start"}>
                                      <span>{topic.name}</span>
                                    </FlexRow>
                                    <FlexRow position={"end"}>
                                      {topic.followed && <Tag>Siguiendo</Tag>}
                                      {!topic.followed &&
                                          <Button clickAction={() => handleFollowTopic(topic.uuid)}
                                                  disabled={topic.is_owner} grow={false}><AddIcon/></Button>
                                      }
                                      {topic.followed &&
                                          <Button clickAction={() => handleUnfollowTopic(topic.uuid)}
                                                  disabled={topic.is_owner} grow={false}><MinusIcon/></Button>
                                      }
                                    </FlexRow>
                                  </FlexRow>
                                </MenuItem>
                              )}
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
