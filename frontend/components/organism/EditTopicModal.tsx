import React, {useEffect, useState} from "react";
import {updateTopic} from "../../services/topicService";
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
import {Topic} from "../../entities/Topic";

export const EditTopicModalId = "edit-topic-modal";

type EditTopicModalProps = {
  topic: Topic,
  subscriptions: Subscription[];
  refreshTopics: () => void;
  refreshTopicItems: () => void;
}

const EditTopicModal = (props: EditTopicModalProps) => {
  const [newTopicName, setNewTopicName] = useState(props.topic.name);
  const [subscriptionsToAdd, addSubscription, removeSubscription, clearSubscriptions, setSubscriptions] = useSubscriptionsToAdd(props.subscriptions, props.topic)

  const subscriptionBadges = subscriptionsToAdd.map(s => subscriptionToBadge(s, removeSubscription));

  const filteredSubscriptions = props.subscriptions.filter((sub) => props.topic.subscriptions_ids.includes(sub.uuid))

  const onSubscriptionSelected = (subscriptionId: string) => {
    const subscription = props.subscriptions.find(subscription => subscription.uuid === subscriptionId);
    if (subscription && !subscriptionsToAdd.map(s => s.uuid).includes(subscription.uuid)) {
      addSubscription(subscription);
    }
  }

  useEffect(() => {
    setNewTopicName(props.topic.name)
    setSubscriptions(filteredSubscriptions)
  }, [props.topic, props.subscriptions])

  return (
    <Modal id={EditTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">Edit topic</h1>
        <InputText placeholder="Topic name" value={newTopicName} onChange={(value) => setNewTopicName(value)}/>
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
            updateTopic(props.topic.uuid, newTopicName, subscriptionsToAdd.map(s => s.uuid)).then(
              () => {
                setNewTopicName("");
                props.refreshTopics();
                props.refreshTopicItems();
                clearSubscriptions();
                closeModal(EditTopicModalId);
              }
            )
          }}>
            <span>Edit</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

function subscriptionToBadge(subscription: Subscription, removeSubscription: (subscription: Subscription) => void) {
  return (
    <Tag key={subscription.uuid}>
      <FlexRow>
        <div onClick={() => removeSubscription(subscription)} className="hover:cursor-pointer">
          <CrossIcon/>
        </div>
        {subscription.name}
      </FlexRow>
    </Tag>
  )
}

export default EditTopicModal;
