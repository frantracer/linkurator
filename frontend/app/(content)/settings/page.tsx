'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useEffect, useRef, useState} from "react";
import {paths} from "../../../configuration";
import Button from "../../../components/atoms/Button";
import PageHeader from "../../../components/molecules/PageHeader";
import SettingsSection from "../../../components/molecules/SettingsSection";
import {useLocale, useTranslations} from "next-intl";
import useUserFilter from "../../../hooks/useUserFilter";
import LanguageSelector from "../../../components/molecules/LanguageSelector";
import ThemeToggleButton from "../../../components/molecules/ThemeToggleButton";
import Checkbox from "../../../components/atoms/Checkbox";
import NumberInput from "../../../components/atoms/NumberInput";
import {Filters, areFiltersEqual, durationOptions} from "../../../entities/Filters";
import {
  ArchiveBoxFilledIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon, SettingsIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon
} from "../../../components/atoms/Icons";
import {useToast} from "../../../contexts/ToastContext";
import {Theme} from "../../../utilities/themeConfig";

const SettingsPage: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();
  const {userFilter, isLoading, refreshUserFilter, upsertUserFilter, deleteUserFilter} = useUserFilter();
  const [localFilter, setLocalFilter] = useState<Filters>(userFilter);
  const hasFilterChanged = !areFiltersEqual(localFilter, userFilter);
  const {showToast, showErrorToast} = useToast();
  const locale = useLocale();
  const previousLocale = useRef(locale);

  // The toast is shown once the page re-renders with the new locale, so it is written in the new language
  useEffect(() => {
    if (previousLocale.current !== locale) {
      previousLocale.current = locale;
      showToast(t("language_changed"));
    }
  }, [locale, showToast, t]);

  useEffect(() => {
    if (!profileIsLoading && !profile) {
      router.push(paths.LOGIN);
    }
  }, [profileIsLoading, router, profile]);

  useEffect(() => {
    setLocalFilter(userFilter);
  }, [userFilter]);

  const handleSave = () => {
    upsertUserFilter(localFilter, {
      onSuccess: () => showToast(t("filter_saved_successfully")),
      onError: () => showErrorToast(t("error_saving_filter"))
    });
  };

  const handleDelete = () => {
    deleteUserFilter(undefined, {
      onSuccess: async () => {
        showToast(t("filter_reset_successfully"));
        await refreshUserFilter();
      },
      onError: () => showErrorToast(t("error_resetting_filter"))
    });
  };

  if (profileIsLoading || isLoading) {
    return (
      <main className="flex flex-col h-full bg-base-300">
        <PageHeader title={t("settings")} icon={<SettingsIcon/>}/>
        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-4 py-6" aria-busy="true">
          <div className="h-32 rounded-2xl bg-base-100 animate-pulse"/>
          <div className="h-80 rounded-2xl bg-base-100 animate-pulse"/>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const optionRowClass = "flex flex-row items-center gap-2 py-1 text-sm cursor-pointer";

  return (
    <main className="flex flex-col h-full overflow-hidden bg-base-300">
      <PageHeader title={t("settings")} icon={<SettingsIcon/>}/>
      <div className="h-full overflow-y-auto pb-mobile-nav">
        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-4 py-6">
          <SettingsSection title={t("appearance")}>
            <div className="flex flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium">{t("theme")}</span>
              <ThemeToggleButton onThemeChange={(theme) => {
                showToast(t(theme === Theme.DARK ? "dark_theme_enabled" : "light_theme_enabled"));
              }}/>
            </div>
            <div className="flex flex-row items-center justify-between gap-4">
              <span className="text-sm font-medium">{t("language")}</span>
              <LanguageSelector/>
            </div>
          </SettingsSection>

          <SettingsSection title={t("default_filter_settings")}>
            <fieldset className="flex flex-col gap-1">
              <legend className="text-sm font-medium pb-1">{t("duration")}</legend>
              {durationOptions.map((option) => (
                <label key={option.key} className={optionRowClass}>
                  <input
                    type="radio"
                    name="duration-group"
                    className="radio radio-primary radio-sm"
                    checked={localFilter.durationGroup === option.key}
                    onChange={() => {
                      setLocalFilter({
                        ...localFilter,
                        durationGroup: option.key,
                        minDuration: option.key === "custom" ? localFilter.minDuration : undefined,
                        maxDuration: option.key === "custom" ? localFilter.maxDuration : undefined,
                      });
                    }}
                  />
                  {t(option.label)}
                </label>
              ))}
              {localFilter.durationGroup === "custom" && (
                <div className="grid grid-cols-2 gap-3 pt-2 max-w-xs">
                  <label className="flex flex-col gap-1 text-xs">
                    {t("min_minutes")}
                    <NumberInput
                      value={localFilter.minDuration}
                      onChange={(newMin) => setLocalFilter({...localFilter, minDuration: newMin})}
                      placeholder={t("min_placeholder")}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs">
                    {t("max_minutes")}
                    <NumberInput
                      value={localFilter.maxDuration}
                      onChange={(newMax) => setLocalFilter({...localFilter, maxDuration: newMax})}
                      placeholder={t("max_placeholder")}
                    />
                  </label>
                </div>
              )}
            </fieldset>
            <fieldset className="flex flex-col gap-1">
              <legend className="text-sm font-medium pb-1">{t("show_items")}</legend>
                <label className={optionRowClass}>
                  <Checkbox
                    checked={localFilter.displayWithoutInteraction}
                    onChange={(checked) => setLocalFilter({...localFilter, displayWithoutInteraction: checked})}
                  />
                  <CheckCircleIcon/>
                  {t("not_viewed")}
                </label>
                <label className={optionRowClass}>
                  <Checkbox
                    checked={localFilter.displayViewed}
                    onChange={(checked) => setLocalFilter({...localFilter, displayViewed: checked})}
                  />
                  <CheckCircleFilledIcon/>
                  {t("viewed")}
                </label>
                <label className={optionRowClass}>
                  <Checkbox
                    checked={localFilter.displayRecommended}
                    onChange={(checked) => setLocalFilter({...localFilter, displayRecommended: checked})}
                  />
                  <ThumbsUpFilledIcon/>
                  {t("recommended")}
                </label>
                <label className={optionRowClass}>
                  <Checkbox
                    checked={localFilter.displayDiscouraged}
                    onChange={(checked) => setLocalFilter({...localFilter, displayDiscouraged: checked})}
                  />
                  <ThumbsDownFilledIcon/>
                  {t("not_recommended")}
                </label>
                <label className={optionRowClass}>
                  <Checkbox
                    checked={localFilter.displayHidden}
                    onChange={(checked) => setLocalFilter({...localFilter, displayHidden: checked})}
                  />
                  <ArchiveBoxFilledIcon/>
                  {t("archived")}
                </label>
            </fieldset>
            <div className="flex flex-row justify-end gap-2">
              <Button primary={false} clickAction={handleDelete} disabled={isLoading}>
                {t("reset_to_default")}
              </Button>
              <Button clickAction={handleSave} disabled={isLoading || !hasFilterChanged}>
                {t("save_filter")}
              </Button>
            </div>
          </SettingsSection>

          <SettingsSection title={t("about_linkurator")}>
            <a href="https://www.linkedin.com/in/frantracer/" target="_blank" rel="noopener noreferrer"
               className="text-sm link link-hover">
              {t("project_by")} <b>@frantracer</b>
            </a>
          </SettingsSection>
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
