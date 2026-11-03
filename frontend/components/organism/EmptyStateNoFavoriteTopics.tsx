import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {StarIcon} from "../atoms/Icons";
import {paths} from "../../configuration";

const EmptyStateNoFavoriteTopics = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      icon={<StarIcon/>}
      title={t("no_favorite_topics_title")}
      message={t("no_favorite_topics_message")}
    >
      <Button href={paths.TOPICS}>
        {t("browse_topics")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateNoFavoriteTopics;
