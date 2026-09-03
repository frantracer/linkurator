import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {MagnifyingGlassIcon} from "../atoms/Icons";
import {FindCuratorModalId} from "./FindCuratorModal";
import {openModal} from "../../utilities/modalAction";

const EmptyStateNoFollowedCurators = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      title={t("no_followed_curators_title")}
      message={t("no_followed_curators_message")}
    >
      <Button
        clickAction={() => openModal(FindCuratorModalId)}
        primary={false}
        fitContent={true}
      >
        <MagnifyingGlassIcon/>
        {t("discover_curators")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateNoFollowedCurators;
