import React from "react";
import {useTranslations} from "next-intl";
import {useRouter} from "next/navigation";
import {v4 as uuidv4} from 'uuid';
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {paths} from "../../configuration";

const EmptyStateOrganizeSubscriptions = () => {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <EmptyStateBox
      title={t("organize_subscriptions_title")}
      message={t("organize_subscriptions_description")}
    >
      <Button
        clickAction={() => {
          router.push(paths.CHATS + "/" + uuidv4());
        }}
        primary={false}
        fitContent={true}
      >
        {t("try_chatbot")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateOrganizeSubscriptions;
