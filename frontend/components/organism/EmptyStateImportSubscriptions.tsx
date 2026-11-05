import React from "react";
import classNames from "classnames";
import {useTranslations} from "next-intl";
import Button from "../atoms/Button";
import {MagnifyingGlassIcon} from "../atoms/Icons";
import ImportProviderTiles from "../molecules/ImportProviderTiles";
import {openImportModal} from "../../utilities/importModalAction";
import {openSearchPalette} from "../../utilities/searchPaletteAction";

const EmptyStateImportSubscriptions = () => {
  const t = useTranslations("common");

  const steps = [t("onboarding_step_import"), t("onboarding_step_group"), t("onboarding_step_follow")];

  return (
    <section className="flex flex-col gap-5 w-full max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">{t("add_your_content")}</h2>
        <p className="text-sm text-base-content/70">{t("import_subscriptions_providers")}</p>
      </div>
      <ImportProviderTiles onChooseStep={openImportModal} columns={4}/>
      <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step, index) => (
          <li key={step} className={classNames(
            "flex flex-row items-center gap-2 pt-2 border-t-4 text-sm",
            {
              "border-primary font-semibold": index === 0,
              "border-neutral text-base-content/70": index !== 0,
            }
          )}>
            <span className={classNames("flex items-center justify-center w-5 h-5 rounded-full text-xs border", {
              "bg-primary border-primary text-primary-content": index === 0,
              "border-neutral": index !== 0,
            })}>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
      <div>
        <Button primary={false} borderless={true} clickAction={() => openSearchPalette("subscriptions")}>
          <MagnifyingGlassIcon/>
          {t("discover_subscriptions")}
        </Button>
      </div>
    </section>
  );
}

export default EmptyStateImportSubscriptions;
