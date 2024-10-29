import React, {useState} from "react";
import {updateTopic} from "../../services/topicService";
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import {Subscription} from "../../entities/Subscription";
import Button from "../atoms/Button";
import InputText from "../atoms/InputText";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import Box from "../atoms/Box";
import FlexRow from "../atoms/FlexRow";
import FlexColumn from "../atoms/FlexColumn";
import {Topic} from "../../entities/Topic";
import Dropdown from "../atoms/Dropdown";
import {MenuItem} from "../atoms/MenuItem";
import Menu from "../atoms/Menu";
import Miniature from "../atoms/Miniature";
import FlexItem from "../atoms/FlexItem";
import {CheckCircleIcon, CircleIcon} from "../atoms/Icons";
import Tag from "../atoms/Tag";
import SearchBar from "../molecules/SearchBar";
import ALink from "../atoms/ALink";
import {paths} from "../../configuration";

export const EditTopicModalId = "edit-topic-modal";

type EditTopicModalProps = {
  topic: Topic,
  subscriptions: Subscription[];
  refreshTopics: () => void;
  refreshTopicItems: () => void;
  refreshSubscriptions: () => void;
}

const EditTopicModal = (props: EditTopicModalProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [newTopicName, setNewTopicName] = useState(props.topic.name);
  const {
    subscriptionsToAdd,
    addSubscription,
    removeSubscription
  } = useSubscriptionsToAdd(props.subscriptions, props.topic)

  const handleUpdateTopic = () => {
    updateTopic(props.topic.uuid, newTopicName, subscriptionsToAdd.map(s => s.uuid)).then(
      () => {
        props.refreshTopics();
        props.refreshTopicItems();
        props.refreshSubscriptions();
        closeModal(EditTopicModalId);
      }
    )
  }

  const subscriptionsMenuItems = props.subscriptions
    .filter(subscription => subscription.name.toLowerCase().includes(searchValue.toLowerCase()))
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
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(subscription => {
      return (
        <ALink key={subscription.uuid} href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}>
          <Tag>
            <Miniature src={subscription.thumbnail} alt={subscription.name}/>
            {subscription.name}
          </Tag>
        </ALink>)
    })

  return (
    <Modal id={EditTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{"Editar categoría"}</h1>
        <InputText placeholder="Nombre de la categoría" value={newTopicName}
                   onChange={(value) => setNewTopicName(value)}/>
        <Box title={"Subscripciones (" + subscriptionTags.length + ")"}>
          <div className={"h-60 overflow-y-auto"}>
            <FlexRow wrap={true}>
              {subscriptionTags.length === 0 &&
                  <p>{"No hay subscripciones"}</p>
              }
              {subscriptionTags.length > 0 &&
                subscriptionTags
              }
            </FlexRow>
          </div>
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
          <Button clickAction={handleUpdateTopic}>
            <span>{"Editar"}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default EditTopicModal;
