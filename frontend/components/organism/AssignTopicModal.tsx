import {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {useQueryClient} from '@tanstack/react-query';
import {paths} from "../../configuration";
import {Subscription} from "../../entities/Subscription";
import {Topic, topicSorting} from "../../entities/Topic";
import {assignSubscriptionToTopic, createTopic, unassignSubscriptionToTopic} from "../../services/topicService";
import ALink from "../atoms/ALink";
import Box from "../atoms/Box";
import Button from "../atoms/Button";
import Dropdown from "../atoms/Dropdown";
import FlexColumn from "../atoms/FlexColumn";
import FlexItem from "../atoms/FlexItem";
import FlexRow from "../atoms/FlexRow";
import {AddIcon, CheckCircleIcon, CircleIcon, CrossIcon} from "../atoms/Icons";
import InputText from "../atoms/InputText";
import Menu from "../atoms/Menu";
import {MenuItem} from "../atoms/MenuItem";
import Modal from "../atoms/Modal";
import Tag from "../atoms/Tag";
import SearchBar from "../molecules/SearchBar";
import {useTranslations} from 'next-intl';

export const AssignTopicModalId = "assign-topic-modal";

type AssignTopicModalProps = {
  topics: Topic[];
  subscription: Subscription;
  refreshTopics: () => void;
}

const AssignTopicModal = (props: AssignTopicModalProps) => {
  const t = useTranslations("common");
  const queryClient = useQueryClient();
  const [topicName, setTopicName] = useState<string>("");
  const [searchValue, setSearchValue] = useState("");

  function assignButtonAction(topicId: string) {
    assignSubscriptionToTopic(topicId, props.subscription.uuid)
      .then(() => {
        props.refreshTopics();
        // Invalidate topic items cache
        queryClient.invalidateQueries({ queryKey: ['topicItems', topicId] });
      })
      .catch(err => console.log(err));
  }

  function unassignButtonAction(topicId: string) {
    unassignSubscriptionToTopic(topicId, props.subscription.uuid)
      .then(() => {
        props.refreshTopics();
        // Invalidate topic items cache
        queryClient.invalidateQueries({ queryKey: ['topicItems', topicId] });
      })
      .catch(err => console.log(err));
  }

  function newTopicButtonAction(topic_name: string) {
    if (topic_name.length > 0) {
      const new_uuid = uuidv4();
      createTopic(new_uuid, topic_name, [])
        .then(async () => {
          await assignSubscriptionToTopic(new_uuid, props.subscription.uuid)
          props.refreshTopics();
          // Invalidate topic items cache
          queryClient.invalidateQueries({ queryKey: ['topicItems', new_uuid] });
        })
        .catch(err => console.log(err));
      setTopicName("");
    }
  }

  const topicsMenuItems = props.topics
    .filter(topic => topic.is_owner && topic.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort(topicSorting)
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
        <ALink href={paths.TOPICS + "/" + topic.uuid} key={topic.uuid}>
          <Tag>
            {topic.name}
            <div onClick={
              (e) => {
                e.preventDefault();
                e.stopPropagation();
                unassignButtonAction(topic.uuid);
              }
            }>
              <CrossIcon/>
            </div>
          </Tag>
        </ALink>
      )
    })

  return (
    <Modal id={AssignTopicModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t("assign_subscription")}</h1>
        <FlexRow>
          <InputText placeholder={t("new_topic_name")}
                     value={topicName} onChange={(value) => setTopicName(value)}/>
          <Button clickAction={() => {
            newTopicButtonAction(topicName);
          }}>
            {t("create")}
          </Button>
        </FlexRow>
        <Box title={t("topics") + " (" + topicTags.length + ")"}>
          <div className={"h-60 overflow-y-auto"}>
            <FlexRow wrap={true}>
              {topicTags.length === 0 &&
                  <p><b>{props.subscription.name}</b> {t("not_assigned_to_any_topic")}</p>
              }
              {topicTags.length > 0 &&
                topicTags
              }
            </FlexRow>
          </div>
        </Box>
        <FlexRow hideOverflow={false} position={"center"}>
          <Dropdown
            start={true}
            bottom={false}
            button={
              <FlexRow>
                <AddIcon/>
                {t("assign_topic")}
              </FlexRow>
            }>
            <div className={"h-60"}>
              <Menu>
                {topicsMenuItems}
              </Menu>
            </div>
            <SearchBar value={searchValue} placeholder={t("search_placeholder")}
                       handleChange={(value) => setSearchValue(value)}/>
          </Dropdown>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default AssignTopicModal;
