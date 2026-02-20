import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from '@tanstack/react-query';
import { paths } from "../../configuration";
import { getProviderIcon, Provider } from "../../entities/Provider";
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
import { AddIcon, CheckCircleIcon, CircleIcon, CrossIcon } from "../atoms/Icons";
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
  providers: Provider[];
  refreshTopics: () => void;
  refreshTopicItems: () => void;
  refreshSubscriptions: () => void;
}

const EditTopicModal = ({ providers, ...props }: EditTopicModalProps) => {
  const t = useTranslations("common");
  const queryClient = useQueryClient();
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
        // Invalidate topic items cache
        queryClient.invalidateQueries({ queryKey: ['topicItems', props.topic.uuid] });
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
          <Miniature src={getProviderIcon(providers, subscription.provider)} alt={subscription.provider}/>
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
        <ALink key={subscription.uuid} href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
               onClick={handleCancel}>
          <Tag>
            <Miniature src={getProviderIcon(providers, subscription.provider)} alt={subscription.provider}/>
            <Miniature src={subscription.thumbnail} alt={subscription.name}/>
            {subscription.name}
            <div onClick={
              (e) => {
                e.preventDefault();
                e.stopPropagation();
                removeSubscription(subscription);
              }
            }>
              <CrossIcon/>
            </div>
          </Tag>
        </ALink>)
    })

  return (
    <Modal id={EditTopicModalId} onClose={handleCancel}>
      <h1 className="font-bold text-xl w-full text-center mb-4">{t("edit_topic")}</h1>
      <FlexColumn>
        <Box title={t("subscriptions") + " (" + subscriptionsToAdd.length + ")"}>
          <div className={"h-60 flex flex-col overflow-auto mb-2"}>
            <FlexRow wrap={true}>
              {subscriptionTags.length > 0 &&
                subscriptionTags
              }
            </FlexRow>
          </div>
          <Dropdown
            position={"center"}
            bottom={false}
            button={
              <div className="flex flex-row justify-center items-center w-72">
                <AddIcon/>
                {t("add_subscriptions")}
              </div>
            }>
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
        </Box>
        <InputText placeholder={t("new_topic_name")} value={newTopicName}
                   onChange={(value) => setNewTopicName(value)}/>
        <FlexRow position={"center"}>
          <Button clickAction={handleCancel} primary={false}>
            <span>{t("cancel")}</span>
          </Button>
          <Button clickAction={handleUpdateTopic} primary={true}>
            <span>{t("edit")}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default EditTopicModal;
