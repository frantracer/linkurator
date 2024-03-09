import React, {useState} from "react";
import {createTopic} from "../../services/topicService";
import {v4 as uuidv4} from 'uuid';
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import {Subscription} from "../../entities/Subscription";
import Button from "../atoms/Button";
import InputText from "../atoms/InputText";
import Tag from "../atoms/Tag";
import Modal from "../atoms/Modal";
import {closeModal} from "../../utilities/modalAction";
import {CrossIcon} from "../atoms/Icons";
import Box from "../atoms/Box";
import Dropdown from "../atoms/Dropdown";
import FlexRow from "../atoms/FlexRow";
import FlexColumn from "../atoms/FlexColumn";

export const NewTopicModalId = "new-topic-modal";

type NewTopicModalProps = {
  subscriptions: Subscription[];
  refreshTopics: () => void;
}

const NewTopicModal = (props: NewTopicModalProps) => {
  const [newTopicName, setNewTopicName] = useState("");
  const [subscriptionsToAdd, addSubscription, removeSubscription, clearSubscriptions] = useSubscriptionsToAdd([], undefined)

  const subscriptionBadges = subscriptionsToAdd.map(s => subscriptionToBadge(s, removeSubscription));

  const onSubscriptionSelected = (subscriptionId: string) => {
    const subscription = props.subscriptions.find(subscription => subscription.uuid === subscriptionId);
    if (subscription && !subscriptionsToAdd.map(s => s.uuid).includes(subscription.uuid)) {
      addSubscription(subscription);
    }
  }

  return (
    <Modal id={NewTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">Create new topic</h1>
        <InputText placeholder="New topic name" value={newTopicName} onChange={(value) => setNewTopicName(value)}/>
        <Dropdown title={"Pick subscription"} options={
          props.subscriptions.map(subscription => {
            return {key: subscription.uuid, label: subscription.name}
          })
        } onChange={(key) => onSubscriptionSelected(key)}/>
        <Box title={"Subscriptions"}>
          <FlexRow position={"start"} wrap={true}>
            {subscriptionBadges}
          </FlexRow>
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
            <span>Create</span>
          </Button>
        </FlexRow>

      </FlexColumn>
    </Modal>
  )
}

function subscriptionToBadge(subscription: Subscription, removeSubscription: (subscription: Subscription) => void) {
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
