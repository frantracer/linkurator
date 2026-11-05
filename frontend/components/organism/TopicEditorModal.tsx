import React, {useEffect, useId, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {useQueryClient} from "@tanstack/react-query";
import {v4 as uuidv4} from "uuid";
import {paths} from "../../configuration";
import {getProviderIcon, Provider} from "../../entities/Provider";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {Topic} from "../../entities/Topic";
import {createTopic, updateTopic} from "../../services/topicService";
import {closeModal} from "../../utilities/modalAction";
import Button from "../atoms/Button";
import Checkbox from "../atoms/Checkbox";
import InputText from "../atoms/InputText";
import Miniature from "../atoms/Miniature";
import Modal from "../atoms/Modal";
import SearchBar from "../molecules/SearchBar";

export const NewTopicModalId = "new-topic-modal";
export const EditTopicModalId = "edit-topic-modal";

type TopicEditorModalProps = {
  topic?: Topic;
  subscriptions: Subscription[];
  providers: Provider[];
  onSaved: () => void;
}

const selectedIdsOf = (topic: Topic | undefined): string[] => topic ? topic.subscriptions_ids : [];

// Creates a topic when no topic is given, otherwise edits its name and subscriptions
const TopicEditorModal = ({topic, subscriptions, providers, onSaved}: TopicEditorModalProps) => {
  const t = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const nameId = useId();
  const isEditing = topic !== undefined;
  const modalId = isEditing ? EditTopicModalId : NewTopicModalId;

  const [name, setName] = useState(topic ? topic.name : "");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedIdsOf(topic));
  const [searchValue, setSearchValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setName(topic ? topic.name : "");
    setSelectedIds(selectedIdsOf(topic));
  }, [topic]);

  const reset = () => {
    setName(topic ? topic.name : "");
    setSelectedIds(selectedIdsOf(topic));
    setSearchValue("");
    setHasFailed(false);
  };

  const toggle = (subscriptionId: string) => {
    setSelectedIds(selectedIds.includes(subscriptionId)
      ? selectedIds.filter(id => id !== subscriptionId)
      : selectedIds.concat(subscriptionId));
  };

  const visibleSubscriptions = subscriptions
    .filter(subscription => subscription.name.toLowerCase().includes(searchValue.toLowerCase()))
    .sort(subscriptionSorting);

  const canSave = name.trim().length > 0 && (isEditing || selectedIds.length > 0) && !isSaving;

  const save = async () => {
    setIsSaving(true);
    setHasFailed(false);
    try {
      if (topic) {
        await updateTopic(topic.uuid, name.trim(), selectedIds);
        queryClient.invalidateQueries({queryKey: ['topicItems', topic.uuid]});
        closeModal(modalId);
        onSaved();
      } else {
        const newTopicUuid = uuidv4();
        await createTopic(newTopicUuid, name.trim(), selectedIds);
        closeModal(modalId);
        onSaved();
        router.push(paths.TOPICS + "/" + newTopicUuid);
      }
    } catch {
      setHasFailed(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal id={modalId} title={isEditing ? t("edit_topic") : t("create_topic")} size={"md"} onClose={reset}>
      <form className="flex flex-col gap-3" onSubmit={(event) => {
        event.preventDefault();
        if (canSave) {
          save();
        }
      }}>
        <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor={nameId}>
          {t("topic_name")}
          <InputText id={nameId} placeholder={t("enter_new_topic_name")} value={name} onChange={setName}
                     required={true} autofocus={!isEditing}/>
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="flex flex-row justify-between w-full text-sm font-medium pb-1.5">
            <span>{t("subscriptions")}</span>
            <span className="font-normal text-base-content/60">{t("selected_count", {count: selectedIds.length})}</span>
          </legend>
          <SearchBar value={searchValue} placeholder={t("search_subscription")} handleChange={setSearchValue}/>
          <ul className="flex flex-col h-56 overflow-y-auto overflow-x-hidden rounded-lg border border-neutral p-1">
            {visibleSubscriptions.length === 0 &&
                <li className="px-3 py-6 text-center text-sm text-base-content/60">{t("no_subscriptions_found")}</li>
            }
            {visibleSubscriptions.map(subscription => (
              <li key={subscription.uuid}>
                <label className="flex flex-row items-center gap-3 min-w-0 px-2 py-1.5 rounded-md cursor-pointer hover:bg-base-content/5 text-sm">
                  <Checkbox small={true} checked={selectedIds.includes(subscription.uuid)}
                            onChange={() => toggle(subscription.uuid)}/>
                  <Miniature src={subscription.thumbnail} alt=""
                             badgeImage={getProviderIcon(providers, subscription.provider)}/>
                  <span className="flex-1 min-w-0 break-words">{subscription.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        {hasFailed && <p role="alert" className="text-sm text-error">{t("topic_save_failed")}</p>}
        <div className="flex flex-row justify-end gap-2">
          <Button primary={false} clickAction={() => closeModal(modalId)}>{t("cancel")}</Button>
          <Button submit={true} disabled={!canSave}>
            {isSaving && <span className="loading loading-spinner loading-xs"/>}
            {isEditing ? t("save_changes") : t("create_topic")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default TopicEditorModal;
