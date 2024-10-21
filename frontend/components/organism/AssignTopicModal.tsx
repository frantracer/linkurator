import React, {useState} from "react";
import {assignSubscriptionToTopic, createTopic, unassignSubscriptionToTopic} from "../../services/topicService";
import {Topic} from "../../entities/Topic";
import {Subscription} from "../../entities/Subscription";
import {v4 as uuidv4} from 'uuid';
import Modal from "../atoms/Modal";
import InputText from "../atoms/InputText";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import FlexColumn from "../atoms/FlexColumn";
import {CheckCircleIcon, CircleIcon} from "../atoms/Icons";
import Divider from "../atoms/Divider";
import {closeModal} from "../../utilities/modalAction";
import {MenuItem} from "../atoms/MenuItem";
import FlexItem from "../atoms/FlexItem";
import Dropdown from "../atoms/Dropdown";
import Menu from "../atoms/Menu";
import Tag from "../atoms/Tag";

export const AssignTopicModalId = "assign-topic-modal";

type AssignTopicModalProps = {
  topics: Topic[];
  subscription: Subscription;
  refreshTopics: () => void;
}

const AssignTopicModal = (props: AssignTopicModalProps) => {
  const [topicName, setTopicName] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const topicsMenuItems = props.topics
    .filter(topic => topic.is_owner)
    .map(topic => {
      const isSelected = topic.subscriptions_ids.includes(props.subscription.uuid);
      const handleClick = () => {
        if (isSelected) {
          unassignButtonAction(topic.uuid);
        } else {
          assignButtonAction(topic.uuid);
        }
      }
      return (
        <MenuItem key={topic.uuid}
                  selected={false}
                  onClick={handleClick}>
          <FlexRow position={"start"}>
            {topic.name}
            <FlexItem grow={true}/>
            {isSelected && <FlexItem><CheckCircleIcon/></FlexItem>}
            {!isSelected && <FlexItem><CircleIcon/></FlexItem>}
          </FlexRow>
        </MenuItem>
      )
    })

  const topicTags = props.topics
    .filter(topic => topic.is_owner && topic.subscriptions_ids.includes(props.subscription.uuid))
    .map(topic => {
      return (
        <Tag key={topic.uuid}>
          <span className={"whitespace-nowrap truncate"}>{topic.name}</span>
        </Tag>
      )
    })

  return (
    <Modal id={AssignTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{"Añadir subscripciones"}</h1>
        <Box title={"Categorías (" + topicTags.length + ")"}>
          <FlexRow wrap={true}>
            {topicTags.length === 0 &&
                <p>{"No hay categorías disponibles"}</p>
            }
            {topicTags.length > 0 &&
              topicTags
            }
          </FlexRow>
        </Box>

        <FlexRow hideOverflow={false} position={"between"}>
          <Dropdown open={dropdownOpen} onChange={(open) => setDropdownOpen(open)}
                    start={true} bottom={false}
                    button={<FlexRow><span>Selecciona las categorías</span></FlexRow>}>
            <Menu>
              {topicsMenuItems}
            </Menu>
          </Dropdown>
          <Button clickAction={() => {
            closeModal(AssignTopicModalId);
          }}>
            <span>{"Aceptar"}</span>
          </Button>
        </FlexRow>
        <Divider/>
        <p>O crea una nueva categoría</p>
        <FlexRow>
          <InputText placeholder={"Nombre de la nueva categoría"}
                     value={topicName} onChange={(value) => setTopicName(value)}/>
          <Button clickAction={() => {
            newTopicButtonAction(topicName);
          }}>
            {"Crear"}
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default AssignTopicModal;
