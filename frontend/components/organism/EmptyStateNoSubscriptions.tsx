import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {ImportIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {ImportSubscriptionsModalId} from "./ImportSubscriptionsModal";
import {openModal} from "../../utilities/modalAction";
import {FindSubscriptionModalId} from "./FindSubscriptionModal";
import Divider from "../atoms/Divider";

const EmptyStateNoSubscriptions = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={t("add_your_content")}
      message={t("import_subscriptions_providers")}
    >
      <div className={"flex flex-col gap-4 items-center justify-center mb-4"}>
        <Button
          clickAction={() => openModal(ImportSubscriptionsModalId)}
          primary={false}
          fitContent={true}
        >
          <ImportIcon/>
          {t("import_subscriptions")}
        </Button>
        <Divider text={t("or")}/>
        <Button
          clickAction={() => openModal(FindSubscriptionModalId)}
          primary={false}
          fitContent={true}
        >
          <MagnifyingGlassIcon/>
          {t("discover_subscriptions")}
        </Button>
      </div>
    </EmptyStateBox>
  );
}

export default EmptyStateNoSubscriptions;
