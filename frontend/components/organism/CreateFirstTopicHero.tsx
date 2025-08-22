import {NewTopicModalId} from "./NewTopicModal";
import React from "react";
import {AddIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import {openModal} from "../../utilities/modalAction";
import {NewSubscriptionModalId} from "./NewSubscriptionModal";
import FlexColumn from "../atoms/FlexColumn";
import {useTranslations} from "next-intl";

export type CreateFirstTopicHeroProps = {
  numberOfTopics: number;
  numberOfSubscriptions: number;
}

const CreateFirstTopicHero = (
  {
    numberOfTopics,
    numberOfSubscriptions
  }: CreateFirstTopicHeroProps
) => {
  const t = useTranslations("common");

  return (
    <div className="hero min-h-dvh bg-base-100">
      <div className="hero-content text-center">
        <div className="max-w-md">
          {
            numberOfTopics === 0 && numberOfSubscriptions === 0 &&
              <FlexColumn position={"center"}>
                  <p className="text-5xl font-bold">{t("add_your_content")}</p>
                  <p className="py-2">{t("sync_subscriptions_providers")}</p>
                  <Button clickAction={() => openModal(NewSubscriptionModalId)}>
                      <AddIcon/>
                      <span>{t("sync_subscriptions")}</span>
                  </Button>
              </FlexColumn>
          }

          {numberOfSubscriptions > 0 && numberOfTopics === 0 &&
              <FlexColumn position={"center"}>
                  <p className="text-5xl font-bold">{t("create_first_topic")}</p>
                  <p className="py-2">{t("group_subscriptions")}</p>
                  <Button clickAction={() => openModal(NewTopicModalId)}>
                      <AddIcon/>
                      <span>{t("create_topic")}</span>
                  </Button>
              </FlexColumn>
          }
        </div>
      </div>
    </div>
  );
}

export default CreateFirstTopicHero;
