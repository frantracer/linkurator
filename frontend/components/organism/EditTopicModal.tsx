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

  const subscriptionsMenuItems = props.subscriptions.map(subscription => {
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

  return (
    <Modal id={EditTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{"Editar categoría"}</h1>
        <InputText placeholder="Nombre de la categoría" value={newTopicName}
                   onChange={(value) => setNewTopicName(value)}/>
        <Box title={"Subscripciones (" + subscriptionsToAdd.length + ")"}>
          <Dropdown open={dropdownOpen} onChange={(open) => setDropdownOpen(open)}
                    start={true} bottom={false}
                    button={<FlexRow><span>Selecciona varias subscripciones</span></FlexRow>}>
            <Menu>
              {subscriptionsMenuItems}
            </Menu>
          </Dropdown>
        </Box>
        <FlexRow position={"end"}>
          <Button clickAction={handleUpdateTopic}>
            <span>{"Editar"}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default EditTopicModal;
