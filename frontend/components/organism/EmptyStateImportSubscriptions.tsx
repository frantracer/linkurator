import React from "react";
import {useTranslations} from "next-intl";
import EmptyStateBox from "../atoms/EmptyStateBox";
import Button from "../atoms/Button";
import {ImportIcon, MagnifyingGlassIcon} from "../atoms/Icons";
import {ImportSubscriptionsModalId} from "./ImportSubscriptionsModal";
import {openModal} from "../../utilities/modalAction";
import {openSearchPalette} from "../../utilities/searchPaletteAction";

const EmptyStateImportSubscriptions = () => {
  const t = useTranslations("common");

  return (
    <EmptyStateBox
      icon={<ImportIcon/>}
      title={t("add_your_content")}
      message={t("import_subscriptions_providers")}
    >
      <Button clickAction={() => openModal(ImportSubscriptionsModalId)}>
        <ImportIcon/>
        {t("import_subscriptions")}
      </Button>
      <Button primary={false} clickAction={() => openSearchPalette("subscriptions")}>
        <MagnifyingGlassIcon/>
        {t("discover_subscriptions")}
      </Button>
    </EmptyStateBox>
  );
}

export default EmptyStateImportSubscriptions;
