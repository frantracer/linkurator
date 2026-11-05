import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {MagnifyingGlassIcon} from "../atoms/Icons";

type EmptyStateNoMatchesProps = {
  onClearFilters?: () => void;
}

const EmptyStateNoMatches = ({onClearFilters}: EmptyStateNoMatchesProps) => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      icon={<MagnifyingGlassIcon/>}
      title={t("no_matches_title")}
      message={t("no_matches_message")}
    >
      {onClearFilters &&
          <Button primary={false} clickAction={onClearFilters}>{t("reset_filters")}</Button>
      }
    </EmptyStateBox>
  );
}

export default EmptyStateNoMatches;
