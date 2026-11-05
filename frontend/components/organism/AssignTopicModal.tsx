import React, {useState} from "react";
import {v4 as uuidv4} from 'uuid';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Subscription} from "../../entities/Subscription";
import {Topic, topicSorting} from "../../entities/Topic";
import {assignSubscriptionToTopic, createTopic, unassignSubscriptionToTopic} from "../../services/topicService";
import {useToast} from "../../contexts/ToastContext";
import Button from "../atoms/Button";
import Checkbox from "../atoms/Checkbox";
import InputText from "../atoms/InputText";
import Modal from "../atoms/Modal";
import TopicIcon from "../atoms/TopicIcon";
import SearchBar from "../molecules/SearchBar";

export const AssignTopicModalId = "assign-topic-modal";

type AssignTopicModalProps = {
  topics: Topic[];
  subscription: Subscription;
  refreshTopics: () => void;
}

const AssignTopicModal = ({topics, subscription, refreshTopics}: AssignTopicModalProps) => {
  const t = useTranslations("common");
  const queryClient = useQueryClient();
  const {showToast, showErrorToast} = useToast();
  const [topicName, setTopicName] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [pendingTopicIds, setPendingTopicIds] = useState<string[]>([]);

  const runForTopic = async (topicId: string, action: () => Promise<unknown>): Promise<boolean> => {
    setPendingTopicIds(ids => ids.concat(topicId));
    try {
      await action();
      refreshTopics();
      queryClient.invalidateQueries({queryKey: ['topicItems', topicId]});
      return true;
    } catch {
      showErrorToast(t("action_failed"), subscription.name);
      return false;
    } finally {
      setPendingTopicIds(ids => ids.filter(id => id !== topicId));
    }
  };

  const setAssignment = (topic: Topic, assign: boolean, offerUndo: boolean) => {
    runForTopic(topic.uuid, () => assign
      ? assignSubscriptionToTopic(topic.uuid, subscription.uuid)
      : unassignSubscriptionToTopic(topic.uuid, subscription.uuid)
    ).then(succeeded => {
      if (succeeded && offerUndo) {
        showToast(
          assign
            ? t("subscription_added_to_topic", {topic: topic.name})
            : t("subscription_removed_from_topic", {topic: topic.name}),
          subscription.name,
          () => setAssignment(topic, !assign, false)
        );
      }
    });
  };

  const toggleTopic = (topic: Topic, assigned: boolean) => setAssignment(topic, !assigned, true);

  const createTopicWithSubscription = () => {
    const name = topicName.trim();
    if (name.length === 0) {
      return;
    }
    const newTopicUuid = uuidv4();
    setTopicName("");
    runForTopic(newTopicUuid, () => createTopic(newTopicUuid, name, [subscription.uuid])).then(succeeded => {
      if (succeeded) {
        showToast(t("subscription_added_to_topic", {topic: name}), subscription.name);
      }
    });
  };

  const ownTopics = topics
    .filter(topic => topic.is_owner && topic.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort(topicSorting);

  return (
    <Modal id={AssignTopicModalId} title={t("assign_subscription")} size={"md"} onClose={() => setSearchValue("")}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-base-content/70">
          <b className="text-base-content">{subscription.name}</b> · {t("changes_save_automatically")}
        </p>
        <SearchBar value={searchValue} placeholder={t("search_topic_placeholder")} handleChange={setSearchValue}/>
        <ul className="flex flex-col h-72 overflow-y-auto rounded-lg border border-neutral p-1">
          {ownTopics.length === 0 &&
              <li className="px-3 py-6 text-center text-sm text-base-content/60">{t("no_topics_found")}</li>
          }
          {ownTopics.map(topic => {
            const assigned = topic.subscriptions_ids.includes(subscription.uuid);
            const pending = pendingTopicIds.includes(topic.uuid);
            return (
              <li key={topic.uuid}>
                <label className="flex flex-row items-center gap-3 min-w-0 px-2 py-1.5 rounded-md cursor-pointer hover:bg-base-content/5 text-sm">
                  {pending
                    ? <span className="loading loading-spinner loading-xs"/>
                    : <Checkbox small={true} checked={assigned} onChange={() => toggleTopic(topic, assigned)}/>
                  }
                  <TopicIcon name={topic.name} size={"xs"}/>
                  <span className="flex-1 min-w-0 break-words">{topic.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
        <form className="flex flex-col gap-1.5" onSubmit={(event) => {
          event.preventDefault();
          createTopicWithSubscription();
        }}>
          <span className="text-sm font-medium">{t("new_topic_with_subscription")}</span>
          <div className="flex flex-row gap-2">
            <InputText placeholder={t("new_topic_name")} ariaLabel={t("new_topic_name")} value={topicName}
                       onChange={setTopicName}/>
            <Button submit={true} primary={false} disabled={topicName.trim().length === 0}>
              {t("create")}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AssignTopicModal;
