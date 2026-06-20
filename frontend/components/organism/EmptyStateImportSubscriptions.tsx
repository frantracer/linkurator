import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {ImportIcon} from "../atoms/Icons";
import {ImportSubscriptionsModalId} from "./ImportSubscriptionsModal";
import {openModal} from "../../utilities/modalAction";

const EmptyStateImportSubscriptions = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={t("add_your_content")}
      message={t("import_subscriptions_providers")}
    >
      <Button
        clickAction={() => openModal(ImportSubscriptionsModalId)}
        primary={false}
        fitContent={true}
      >
        <ImportIcon/>
        {t("import_subscriptions")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateImportSubscriptions;
