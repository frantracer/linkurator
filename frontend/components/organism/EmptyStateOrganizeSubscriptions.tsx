import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {paths} from "../../configuration";

const EmptyStateOrganizeSubscriptions = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={t("organize_subscriptions_title")}
      message={t("organize_subscriptions_description")}
    >
      <Button
        clickAction={() => {
          window.location.href = paths.CHATS;
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
