import React from "react";
import {AddIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import {openModal} from "../../utilities/modalAction";
import {SynchronizeSubscriptionsModalId} from "./SynchronizeSubscriptionsModal";
import FlexColumn from "../atoms/FlexColumn";
import {useTranslations} from "next-intl";

const SynchronizeSubscriptionsHero = () => {
  const t = useTranslations("common");

  return (
    <div className="hero min-h-dvh bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <FlexColumn position={"center"}>
            <p className="text-5xl font-bold">{t("add_your_content")}</p>
            <p className="py-2">{t("sync_subscriptions_providers")}</p>
            <Button clickAction={() => openModal(SynchronizeSubscriptionsModalId)}>
              <AddIcon/>
              <span>{t("sync_subscriptions")}</span>
            </Button>
          </FlexColumn>
        </div>
      </div>
    </div>
  );
}

export default SynchronizeSubscriptionsHero;
