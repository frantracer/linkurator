import {useRouter} from "next/navigation";
import React, {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {paths} from "../../configuration";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import useSubscriptionsToAdd from "../../hooks/useSubscriptionsToAdd";
import {createTopic} from "../../services/topicService";
import {closeModal} from "../../utilities/modalAction";
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
import Miniature from "../atoms/Miniature";
import Modal from "../atoms/Modal";
import Tag from "../atoms/Tag";
import SearchBar from "../molecules/SearchBar";
import {useTranslations} from 'next-intl';

export const NewTopicModalId = "new-topic-modal";

type NewTopicModalProps = {
  subscriptions: Subscription[];
  refreshTopics: () => void;
}

const NewTopicModal = (props: NewTopicModalProps) => {
  const router = useRouter();
  const t = useTranslations("common");

  const [searchValue, setSearchValue] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const {
    subscriptionsToAdd,
    addSubscription,
    removeSubscription,
    clearSubscriptions
  } = useSubscriptionsToAdd([], undefined)

  const handleClose = () => {
    setNewTopicName("");
    setSearchValue("");
    clearSubscriptions();
    closeModal(NewTopicModalId);
  }

  const subscriptionsMenuItems = props.subscriptions
    .filter(subscription => subscription.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort(subscriptionSorting)
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
    .sort(subscriptionSorting)
    .map(subscription => {
      return (
        <ALink key={subscription.uuid} href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}
               onClick={handleClose}>
          <Tag>
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
    <Modal id={NewTopicModalId} onClose={handleClose}>
      <h1 className="font-bold text-xl w-full text-center mb-4">{t("create_topic")}</h1>
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
            start={true} bottom={false}
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
        <InputText placeholder={t("enter_new_topic_name")} value={newTopicName}
                   onChange={(value) => setNewTopicName(value)}/>
        <FlexRow hideOverflow={false} position={"center"}>
          <Button
            clickAction={handleClose}
            primary={false}
          >
            <span>{t("cancel")}</span>
          </Button>
          <Button
            disabled={subscriptionsToAdd.length == 0 || newTopicName.length == 0}
            clickAction={async () => {
              const newTopicUuid = uuidv4();
              createTopic(newTopicUuid, newTopicName, subscriptionsToAdd.map(s => s.uuid)).then(
                () => {
                  handleClose();
                  props.refreshTopics();
                  router.push(paths.TOPICS + "/" + newTopicUuid);
                }
              )
            }}
            primary={true}
          >
            <span>{t("create")}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default NewTopicModal;
