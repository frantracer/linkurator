import React from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {v4 as uuidv4} from 'uuid';
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {AddIcon, RectangleGroup} from "../atoms/Icons";
import {NewTopicModalId} from "./TopicEditorModal";
import {openModal} from "../../utilities/modalAction";
import {paths} from "../../configuration";

const EmptyStateOrganizeSubscriptions = () => {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <EmptyStateBox
      icon={<RectangleGroup/>}
      title={t("organize_subscriptions_title")}
      message={t("organize_subscriptions_description")}
    >
      <Button clickAction={() => openModal(NewTopicModalId)}>
        <AddIcon/>
        {t("create_topic")}
      </Button>
      <Button primary={false} clickAction={() => router.push(paths.CHATS + "/" + uuidv4())}>
        {t("try_chatbot")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateOrganizeSubscriptions;
