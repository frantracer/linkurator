import React from "react";
import {AddIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import {openModal} from "../../utilities/modalAction";
import {ImportSubscriptionsModalId} from "./ImportSubscriptionsModal";
import FlexColumn from "../atoms/FlexColumn";
import {useTranslations} from "next-intl";

const ImportSubscriptionsHero = () => {
  const t = useTranslations("common");

  return (
    <div className="hero min-h-dvh bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <FlexColumn position={"center"}>
            <p className="text-5xl font-bold">{t("add_your_content")}</p>
            <p className="py-2">{t("import_subscriptions_providers")}</p>
            <Button clickAction={() => openModal(ImportSubscriptionsModalId)}>
              <AddIcon/>
              <span>{t("import_subscriptions")}</span>
            </Button>
          </FlexColumn>
        </div>
      </div>
    </div>
  );
}

export default ImportSubscriptionsHero;
