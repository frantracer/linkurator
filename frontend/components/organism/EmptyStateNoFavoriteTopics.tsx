import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {paths} from "../../configuration";

const EmptyStateNoFavoriteTopics = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={t("no_favorite_topics_title")}
      message={t("no_favorite_topics_message")}
    >
      <Button
        clickAction={() => {
          window.location.href = paths.TOPICS;
        }}
        primary={false}
        fitContent={true}
      >
        {t("browse_topics")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateNoFavoriteTopics;
