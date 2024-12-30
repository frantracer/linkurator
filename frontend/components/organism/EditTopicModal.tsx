import { useState } from "react";
import { useTranslations } from "next-intl";
import { paths } from "../../configuration";
import { Subscription } from "../../entities/Subscription";
import { Topic } from "../../entities/Topic";
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import { updateTopic } from "../../services/topicService";
import { closeModal } from "../../utilities/modalAction";
import ALink from "../atoms/ALink";
import Box from "../atoms/Box";
import Button from "../atoms/Button";
import Dropdown from "../atoms/Dropdown";
import FlexColumn from "../atoms/FlexColumn";
import FlexItem from "../atoms/FlexItem";
import FlexRow from "../atoms/FlexRow";
import { CheckCircleIcon, CircleIcon } from "../atoms/Icons";
import InputText from "../atoms/InputText";
import Menu from "../atoms/Menu";
import { MenuItem } from "../atoms/MenuItem";
import Miniature from "../atoms/Miniature";
import Modal from "../atoms/Modal";
import Tag from "../atoms/Tag";
import SearchBar from "../molecules/SearchBar";

export const EditTopicModalId = "edit-topic-modal";

type EditTopicModalProps = {
  topic: Topic,
  subscriptions: Subscription[];
  refreshTopics: () => void;
  refreshTopicItems: () => void;
  refreshSubscriptions: () => void;
}

const EditTopicModal = (props: EditTopicModalProps) => {
  const t = useTranslations("common");
  const [searchValue, setSearchValue] = useState("");
  const [newTopicName, setNewTopicName] = useState(props.topic.name);
  const {
    subscriptionsToAdd,
    addSubscription,
    removeSubscription,
    resetSubscriptions
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

  const handleCancel = () => {
    setNewTopicName(props.topic.name);
    setSearchValue("");
    resetSubscriptions();
    closeModal(EditTopicModalId);
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
    <Modal id={EditTopicModalId} onClose={handleCancel}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t("edit")}</h1>
        <InputText placeholder={t("new_topic_name")} value={newTopicName}
                   onChange={(value) => setNewTopicName(value)}/>
        <Box title={t("subscriptions") + " (" + subscriptionTags.length + ")"}>
          <div className={"h-60 overflow-y-auto"}>
            <FlexRow wrap={true}>
              {subscriptionTags.length === 0 &&
                  <p>{t("no_subscriptions")}</p>
              }
              {subscriptionTags.length > 0 &&
                subscriptionTags
              }
            </FlexRow>
          </div>
        </Box>
        <FlexRow hideOverflow={false} position={"between"}>
          <Dropdown start={true} bottom={false}
                    button={<FlexRow><span>{t("add_or_remove_subscriptions")}</span></FlexRow>}>
            <div className={"h-60"}>
              <Menu>
                {subscriptionsMenuItems.length === 0 &&
                    <MenuItem>{t("no_subscriptions")}</MenuItem>
                }
                {subscriptionsMenuItems.length > 0 && subscriptionsMenuItems}
              </Menu>
            </div>
            <SearchBar value={searchValue} placeholder={t("search_placeholder")} 
            handleChange={(value) => setSearchValue(value)}/>
          </Dropdown>
          <Button clickAction={handleUpdateTopic}>
            <span>{t("edit")}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default EditTopicModal;
