import {NewTopicModalId} from "./NewTopicModal";
import React from "react";
import {AddIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import {openModal} from "../../utilities/modalAction";
import Divider from "../atoms/Divider";
import {NewSubscriptionModalId} from "./NewSubscriptionModal";
import FlexColumn from "../atoms/FlexColumn";
import {useTranslations} from "next-intl";

const CreateFirstTopicHero = () => {
  const t = useTranslations("common");

  return (
    <div className="hero min-h-dvh bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <FlexColumn position={"center"}>
            <p className="text-5xl font-bold">{t("find_content")}</p>
            <p className="py-2">{t("sync_subscriptions")}</p>
            <Button clickAction={() => openModal(NewSubscriptionModalId)}>
              <AddIcon/>
              <span>{t("sync_or_search_subscriptions")}</span>
            </Button>
            <Divider text={t("and")}/>
            <p className="text-5xl font-bold">{t("create_first_topic")}</p>
            <p className="py-2">{t("group_subscriptions")}</p>
            <Button clickAction={() => openModal(NewTopicModalId)}>
              <AddIcon/>
              <span>{t("create_or_search_topics")}</span>
            </Button>
          </FlexColumn>
        </div>
      </div>
    </div>
  );
}

export default CreateFirstTopicHero;
