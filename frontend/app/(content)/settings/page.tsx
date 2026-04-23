'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import {paths} from "../../../configuration";
import Button from "../../../components/atoms/Button";
import FlexColumn from "../../../components/atoms/FlexColumn";
import TopTitle from "../../../components/molecules/TopTitle";
import FlexRow from "../../../components/atoms/FlexRow";
import Box from "../../../components/atoms/Box";
import FlexItem from "../../../components/atoms/FlexItem";
import {useTranslations} from "next-intl";
import useUserFilter from "../../../hooks/useUserFilter";
import LanguageSelector from "../../../components/molecules/LanguageSelector";
import ThemeToggleButton from "../../../components/molecules/ThemeToggleButton";
import Checkbox from "../../../components/atoms/Checkbox";
import NumberInput from "../../../components/atoms/NumberInput";
import {InfoBanner} from "../../../components/atoms/InfoBanner";
import {ErrorBanner} from "../../../components/atoms/ErrorBanner";
import {Filters, durationOptions} from "../../../entities/Filters";
import {
  ArchiveBoxFilledIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon, SettingsIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon
} from "../../../components/atoms/Icons";
import Divider from "../../../components/atoms/Divider";
import ProfileDropdown from "../../../components/organism/ProfileDropdown";

const NOTIFICATION_TIMEOUT = 3000;

const SettingsPage: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();
  const {userFilter, isLoading, refreshUserFilter, upsertUserFilter, deleteUserFilter} = useUserFilter();
  const [localFilter, setLocalFilter] = useState<Filters>(userFilter);

  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!profileIsLoading && !profile) {
      router.push(paths.LOGIN);
    }
  }, [profileIsLoading, router, profile]);

  useEffect(() => {
    setLocalFilter(userFilter);
  }, [userFilter]);

  const handleSave = () => {
    setSaveSuccess(null);

    upsertUserFilter(localFilter, {
      onSuccess: () => {
        setSaveSuccess(true);
        setDeleteSuccess(null);
        setTimeout(() => setSaveSuccess(null), NOTIFICATION_TIMEOUT);
      },
      onError: () => {
        setSaveSuccess(false);
        setDeleteSuccess(null);
      }
    });
  };

  const handleDelete = () => {
    setDeleteSuccess(null);
    deleteUserFilter(undefined, {
      onSuccess: async () => {
        setDeleteSuccess(true);
        setSaveSuccess(null);
        await refreshUserFilter();
        setTimeout(() => setDeleteSuccess(null), NOTIFICATION_TIMEOUT);
      },
      onError: () => {
        setDeleteSuccess(false);
        setSaveSuccess(null);
      }
    });
  };

  if (profileIsLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="flex flex-col h-full overflow-hidden">
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0 flex items-center justify-start"/>
          <h1 className="text-xl font-bold flex-1 min-w-0 flex items-center justify-center gap-2">
            <SettingsIcon/>
            {t("settings")}
          </h1>
          <div className="w-10 shrink-0 flex items-center justify-end">
            <ProfileDropdown profile={profile}/>
          </div>
        </div>
      </TopTitle>
      <div className="h-full bg-base-200 overflow-y-auto">
        <FlexRow position={"center"}>
          <FlexItem grow={true}>
            <FlexRow>
              <FlexItem grow={true}/>
              <FlexItem grow={true}>
                <div className={"px-2 py-4 min-w-80"}>
                  <FlexColumn>
                    <Box title={t("default_filter_settings")}>
                      <FlexColumn>
                        <Box title={t("duration")}>
                          <FlexColumn>
                            {durationOptions.map((option) => (
                              <FlexRow key={option.key} position={"start"}>
                                <input
                                  type="radio"
                                  name="duration-group"
                                  className="radio radio-primary"
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
                                <label>{t(option.label)}</label>
                              </FlexRow>
                            ))}

                            {localFilter.durationGroup === "custom" && (
                              <>
                                <FlexRow>
                                  <p>{t("min")}</p>
                                  <NumberInput
                                    value={localFilter.minDuration}
                                    onChange={(newMin) => {
                                      setLocalFilter({
                                        ...localFilter,
                                        minDuration: newMin,
                                      });
                                    }}
                                    placeholder={t("min_placeholder")}
                                  />
                                </FlexRow>
                                <FlexRow>
                                  <p>{t("max")}</p>
                                  <NumberInput
                                    value={localFilter.maxDuration}
                                    onChange={(newMax) => {
                                      setLocalFilter({
                                        ...localFilter,
                                        maxDuration: newMax,
                                      });
                                    }}
                                    placeholder={t("max_placeholder")}
                                  />
                                </FlexRow>
                              </>
                            )}
                          </FlexColumn>
                        </Box>

                        <Box title={t("interactions")}>
                          <FlexColumn>
                            <FlexRow position={"start"}>
                              <Checkbox
                                checked={localFilter.displayWithoutInteraction}
                                onChange={(checked) => setLocalFilter({
                                  ...localFilter,
                                  displayWithoutInteraction: checked
                                })}
                              />
                              <CheckCircleIcon/>
                              <label>{t("not_viewed")}</label>
                            </FlexRow>
                            <FlexRow position={"start"}>
                              <Checkbox
                                checked={localFilter.displayViewed}
                                onChange={(checked) => setLocalFilter({
                                  ...localFilter,
                                  displayViewed: checked
                                })}
                              />
                              <CheckCircleFilledIcon/>
                              <label>{t("viewed")}</label>
                            </FlexRow>
                            <FlexRow position={"start"}>
                              <Checkbox
                                checked={localFilter.displayRecommended}
                                onChange={(checked) => setLocalFilter({
                                  ...localFilter,
                                  displayRecommended: checked
                                })}
                              />
                              <ThumbsUpFilledIcon/>
                              <label>{t("recommended")}</label>
                            </FlexRow>
                            <FlexRow position={"start"}>
                              <Checkbox
                                checked={localFilter.displayDiscouraged}
                                onChange={(checked) => setLocalFilter({
                                  ...localFilter,
                                  displayDiscouraged: checked
                                })}
                              />
                              <ThumbsDownFilledIcon/>
                              <label>{t("not_recommended")}</label>
                            </FlexRow>
                            <FlexRow position={"start"}>
                              <Checkbox
                                checked={localFilter.displayHidden}
                                onChange={(checked) => setLocalFilter({
                                  ...localFilter,
                                  displayHidden: checked
                                })}
                              />
                              <ArchiveBoxFilledIcon/>
                              <label>{t("archived")}</label>
                            </FlexRow>
                          </FlexColumn>
                        </Box>

                        <FlexRow position={"start"}>
                          <Button
                            fitContent={true}
                            clickAction={handleSave}
                            disabled={isLoading}
                            primary={true}
                          >
                            {t("save_filter")}
                          </Button>
                          <Button
                            fitContent={true}
                            clickAction={handleDelete}
                            disabled={isLoading}
                            primary={false}
                          >
                            {t("reset_to_default")}
                          </Button>
                        </FlexRow>

                        {saveSuccess === true &&
                            <InfoBanner>
                              {t("filter_saved_successfully")}
                            </InfoBanner>
                        }
                        {saveSuccess === false &&
                            <ErrorBanner>
                              {t("error_saving_filter")}
                            </ErrorBanner>
                        }
                        {deleteSuccess === true &&
                            <InfoBanner>
                              {t("filter_reset_successfully")}
                            </InfoBanner>
                        }
                        {deleteSuccess === false &&
                            <ErrorBanner>
                              {t("error_resetting_filter")}
                            </ErrorBanner>
                        }
                      </FlexColumn>
                    </Box>
                    <Divider/>
                    <Box title={t("language")}>
                      <LanguageSelector/>
                    </Box>
                    <Divider/>
                    <Box title={t("theme")}>
                      <ThemeToggleButton/>
                    </Box>
                  </FlexColumn>
                </div>
              </FlexItem>
              <FlexItem grow={true}/>
            </FlexRow>
          </FlexItem>
        </FlexRow>
      </div>
    </main>
  );
};

export default SettingsPage;
