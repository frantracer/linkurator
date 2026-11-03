import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {AddIcon, MagnifyingGlassIcon, RectangleGroup} from "../atoms/Icons";
import {NewTopicModalId} from "./TopicEditorModal";
import {openSearchPalette} from "../../utilities/searchPaletteAction";
import {openModal} from "../../utilities/modalAction";

const EmptyStateNoTopics = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      icon={<RectangleGroup/>}
      title={t("create_first_topic")}
      message={t("follow_and_create")}
    >
      <Button clickAction={() => openModal(NewTopicModalId)}>
        <AddIcon/>
        {t("create_topic")}
      </Button>
      <Button primary={false} clickAction={() => openSearchPalette("topics")}>
        <MagnifyingGlassIcon/>
        {t("find_topics")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateNoTopics;
