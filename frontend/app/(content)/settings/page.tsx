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
import ThemeToogleButton from "../../../components/molecules/ThemeToogleButton";
import Checkbox from "../../../components/atoms/Checkbox";
import {InfoBanner} from "../../../components/atoms/InfoBanner";
import {ErrorBanner} from "../../../components/atoms/ErrorBanner";
import {Filters} from "../../../entities/Filters";
import {
  ArchiveBoxFilledIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon
} from "../../../components/atoms/Icons";
import Divider from "../../../components/atoms/Divider";

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
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <main className="flex flex-col bg-base-100">
      <TopTitle>
        <FlexRow position={'center'}>
          <FlexItem grow={true}>
            <h1 className="text-2xl font-bold text-center">
              {t("settings")}
            </h1>
          </FlexItem>
        </FlexRow>
      </TopTitle>
      <div className="h-full overflow-y-auto">
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
                            <FlexRow>
                              <p>{t("min")}</p>
                              <input
                                className={"input input-sm input-bordered input-primary w-full"}
                                type="number"
                                value={localFilter.minDuration}
                                onChange={(e) => {
                                  const newMin = parseInt(e.target.value) || 0;
                                  setLocalFilter({
                                    ...localFilter,
                                    minDuration: newMin,
                                  });
                                }}
                                min={0}
                              />
                            </FlexRow>
                            <FlexRow>
                              <p>{t("max")}</p>
                              <input
                                className={"input input-sm input-bordered input-primary w-full"}
                                type="number"
                                value={localFilter.maxDuration}
                                onChange={(e) => {
                                  const newMax = parseInt(e.target.value) || 0;
                                  setLocalFilter({
                                    ...localFilter,
                                    maxDuration: newMax,
                                  });
                                }}
                                min={0}
                              />
                            </FlexRow>
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
                      <ThemeToogleButton/>
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
