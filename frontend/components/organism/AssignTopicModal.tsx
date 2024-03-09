import React, {useState} from "react";
import {assignSubscriptionToTopic, createTopic, unassignSubscriptionToTopic} from "../../services/topicService";
import {Topic} from "../../entities/Topic";
import {Subscription} from "../../entities/Subscription";
import {v4 as uuidv4} from 'uuid';
import Modal from "../atoms/Modal";
import Dropdown from "../atoms/Dropdown";
import InputText from "../atoms/InputText";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import Tag from "../atoms/Tag";
import FlexColumn from "../atoms/FlexColumn";
import {CrossIcon} from "../atoms/Icons";

export const AssignTopicModalId = "assign-topic-modal";

type AssignTopicModalProps = {
  topics: Topic[];
  subscription: Subscription;
  refreshTopics: () => void;
}

const EditTopicModal = (props: AssignTopicModalProps) => {
  const [topicName, setTopicName] = useState<string>("");

  const options = props.topics.map(topic => {
    return {key: topic.uuid, label: topic.name}
  })

  function assignButtonAction(topicId: string) {
    assignSubscriptionToTopic(topicId, props.subscription.uuid)
      .then(() => props.refreshTopics())
      .catch(err => console.log(err));
  }

  function unassignButtonAction(topicId: string) {
    unassignSubscriptionToTopic(topicId, props.subscription.uuid)
      .then(() => props.refreshTopics())
      .catch(err => console.log(err));
  }

  function newTopicButtonAction(topic_name: string) {
    if (topic_name.length > 0) {
      const new_uuid = uuidv4();
      createTopic(new_uuid, topic_name, [])
        .then(async () => {
          await assignSubscriptionToTopic(new_uuid, props.subscription.uuid)
          props.refreshTopics();
        })
        .catch(err => console.log(err));
      setTopicName("");
    }
  }

  const filteredTopics = props.topics.filter(topic => topic.subscriptions_ids.includes(props.subscription.uuid));
  const topicTags = filteredTopics.map(topic => {
    return (
      <Tag key={topic.uuid}>
        {topic.name}
        <div className={"hover:cursor-pointer"} onClick={() => unassignButtonAction(topic.uuid)}>
          <CrossIcon/>
        </div>
      </Tag>
    )
  })

  return (
    <Modal id={AssignTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">Assign subscription</h1>
        <Box title={"Topics"}>
          <FlexRow position={"start"}>
            {topicTags}
          </FlexRow>
        </Box>
        <Dropdown title={"Pick topic"} options={options}
                  onChange={(key) => assignButtonAction(key)}/>
        <FlexRow>
          <InputText placeholder={"New topic name"}
                     value={topicName} onChange={(value) => setTopicName(value)}/>
          <Button clickAction={() => {
            newTopicButtonAction(topicName);
          }}>
            Assign
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default EditTopicModal;
