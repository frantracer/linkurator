import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {CuratorIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {openSearchPalette} from "../../utilities/searchPaletteAction";

const EmptyStateNoFollowedCurators = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      icon={<CuratorIcon/>}
      title={t("no_followed_curators_title")}
      message={t("no_followed_curators_message")}
    >
      <Button clickAction={() => openSearchPalette("curators")}>
        <MagnifyingGlassIcon/>
        {t("discover_curators")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateNoFollowedCurators;
