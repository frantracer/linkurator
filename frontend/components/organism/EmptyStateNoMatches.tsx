import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";

type EmptyStateNoMatchesProps = {
  title?: string;
  message?: string;
  children?: React.ReactNode;
}

const EmptyStateNoMatches = ({title, message, children}: EmptyStateNoMatchesProps) => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={title ?? t("no_matches_title")}
      message={message ?? t("no_matches_message")}
    >
      {children}
    </EmptyStateBox>
  );
}

export default EmptyStateNoMatches;
