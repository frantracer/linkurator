import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {AddIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {NewTopicModalId} from "./NewTopicModal";
import {openSearchPalette} from "../../utilities/searchPaletteAction";
import {openModal} from "../../utilities/modalAction";
import Divider from "../atoms/Divider";

const EmptyStateNoTopics = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={t("create_first_topic")}
      message={t("follow_and_create")}
    >
      <div className={"flex flex-col gap-4 items-center justify-center mb-4"}>
        <Button
          clickAction={() => openModal(NewTopicModalId)}
          primary={false}
          fitContent={true}
        >
          <AddIcon/>
          {t("create_topic")}
        </Button>
        <Divider text={t("or")}/>
        <Button
          clickAction={() => openSearchPalette("topics")}
          primary={false}
          fitContent={true}
        >
          <MagnifyingGlassIcon/>
          {t("find_topics")}
        </Button>
      </div>
    </EmptyStateBox>
  );
}

export default EmptyStateNoTopics;
