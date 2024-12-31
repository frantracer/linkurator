'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useCallback, useEffect, useState} from "react";
import {configuration, paths} from "../../../configuration";
import Button from "../../../components/atoms/Button";
import FlexColumn from "../../../components/atoms/FlexColumn";
import TopTitle from "../../../components/molecules/TopTitle";
import FlexRow from "../../../components/atoms/FlexRow";
import Avatar from "../../../components/atoms/Avatar";
import Box from "../../../components/atoms/Box";
import {showLateralMenu} from "../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../components/organism/LateralNavigationMenu";
import {MenuIcon} from "../../../components/atoms/Icons";
import {deleteProfile, updateFirstName, updateLastName, updateUsername} from "../../../services/profileService";
import DeleteAccountModal, {DeleteAccountModalId} from "../../../components/organism/DeleteAccountModal";
import {openModal} from "../../../utilities/modalAction";
import InputText from "../../../components/atoms/InputText";
import Divider from "../../../components/atoms/Divider";
import {ErrorBanner} from "../../../components/atoms/ErrorBanner";
import {InfoBanner} from "../../../components/atoms/InfoBanner";
import {useDebounce} from "../../../hooks/useDebounce";
import FlexItem from "../../../components/atoms/FlexItem";
import LanguageSelector from "../../../components/molecules/LanguageSelector";
import {useTranslations} from "next-intl";

const NOTIFICATION_TIMEOUT = 3000;
const INPUT_DEBOUNCE_TIMEOUT = 500;

const ProfilePage: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading, refreshProfile} = useProfile();

  const email = profile ? profile.email : "";
  const avatarUrl = profile ? profile.avatar_url : "";

  // Change first name
  const [changeFirstNameOk, setChangeFirstNameOk] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const debouncedFirstName = useDebounce<string | null>(firstName, INPUT_DEBOUNCE_TIMEOUT);

  const handleUpdateFirstName = useCallback((value: string) => {
    setChangeFirstNameOk(null);
    updateFirstName(value).then(() => {
      setChangeFirstNameOk(true);
      refreshProfile().then(() => {
        setTimeout(() => {
          setChangeFirstNameOk(null);
        }, NOTIFICATION_TIMEOUT);
      });
    }).catch(() => {
      setChangeFirstNameOk(false);
    })
  }, [refreshProfile]);

  useEffect(() => {
    if (profile !== undefined && debouncedFirstName !== null && debouncedFirstName !== profile.first_name) {
      handleUpdateFirstName(debouncedFirstName);
    }
  }, [debouncedFirstName, profile, handleUpdateFirstName]);

  // Change last name
  const [changeLastNameOk, setChangeLastNameOk] = useState<boolean | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const debouncedLastName = useDebounce<string | null>(lastName, INPUT_DEBOUNCE_TIMEOUT);

  const handleUpdateLastName = useCallback((value: string) => {
    setChangeLastNameOk(null);
    updateLastName(value).then(() => {
      setChangeLastNameOk(true);
      refreshProfile().then(() => {
        setTimeout(() => {
          setChangeLastNameOk(null);
        }, NOTIFICATION_TIMEOUT);
      });
    }).catch(() => {
      setChangeLastNameOk(false);
    })
  }, [refreshProfile]);

  useEffect(() => {
    if (profile !== undefined && debouncedLastName !== null && debouncedLastName !== profile.last_name) {
      handleUpdateLastName(debouncedLastName);
    }
  }, [debouncedLastName, profile, handleUpdateLastName]);

  // Change username
  const [changeUsernameOk, setChangeUsernameOk] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const debouncedUsername = useDebounce<string | null>(username, INPUT_DEBOUNCE_TIMEOUT);

  const handleUpdateUsername = useCallback((value: string) => {
    setChangeUsernameOk(null);
    updateUsername(value).then(() => {
      setChangeUsernameOk(true);
      refreshProfile().then(() => {
        setTimeout(() => {
          setChangeUsernameOk(null);
        }, NOTIFICATION_TIMEOUT);
      });
    }).catch(() => {
      setChangeUsernameOk(false);
    })
  }, [refreshProfile]);

  useEffect(() => {
    if (profile !== undefined && debouncedUsername !== null && debouncedUsername !== profile.username) {
      handleUpdateUsername(debouncedUsername);
    }
  }, [debouncedUsername, profile, handleUpdateUsername]);

  // Redirect to login if not logged in
  useEffect(() => {
    if (!profileIsLoading) {
      if (!profile) {
        router.push(paths.HOME)
      } else {
        setFirstName(profile.first_name);
        setLastName(profile.last_name);
        setUsername(profile.username);
      }
    }
  }, [profileIsLoading, router, profile]);

  return (
    <main className="min-h-screen w-full bg-base-100">
      <TopTitle>
        <FlexRow position={'center'}>
          <FlexItem>
            <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
              <MenuIcon/>
            </Button>
          </FlexItem>
          <FlexItem grow={true}>
            <h1 className="text-2xl font-bold text-center">
              {t("my_profile")}
            </h1>
          </FlexItem>
        </FlexRow>
      </TopTitle>
      <FlexRow position={"center"}>
        <FlexItem grow={true}>
          <FlexRow>
            <FlexItem grow={true}/>
            <FlexItem grow={true}>
              <div className={"m-8 min-w-80"}>
                <FlexColumn>
                  <Box title={t("profile_picture")}>
                    <Avatar src={avatarUrl} alt={username ? username : ""}/>
                  </Box>
                  <Box title={t("personal_data")}>
                    <FlexColumn>
                      <span className={"font-bold"}>{t("first_name")}</span>
                      <InputText value={firstName === null ? "" : firstName} onChange={(value) => {
                        setFirstName(value)
                      }}/>
                      {changeFirstNameOk === false &&
                          <ErrorBanner>
                            {t("error_changing_first_name")}
                          </ErrorBanner>
                      }
                      {changeFirstNameOk === true &&
                          <InfoBanner>
                            {t("first_name_changed_successfully")}
                          </InfoBanner>
                      }
                      <span className={"font-bold"}>{t("last_name")}</span>
                      <InputText value={lastName === null ? "" : lastName} onChange={(value) => {
                        setLastName(value)
                      }}/>
                      {changeLastNameOk === false &&
                          <ErrorBanner>
                            {t("error_changing_last_name")}
                          </ErrorBanner>
                      }
                      {changeLastNameOk === true &&
                          <InfoBanner>
                            {t("last_name_changed_successfully")}
                          </InfoBanner>
                      }

                      <span className={"font-bold"}>{t("username")}</span>
                      <InputText value={username === null ? "" : username} onChange={(value) => {
                        setUsername(value)
                      }}/>
                      {changeUsernameOk === false &&
                          <ErrorBanner>
                            {t("error_changing_username")}
                          </ErrorBanner>
                      }
                      {changeUsernameOk === true &&
                          <InfoBanner>
                            {t("username_changed_successfully")}
                          </InfoBanner>
                      }

                      <span className={"font-bold"}>{t("email")}</span>
                      <InputText value={email} disabled={true}/>
                    </FlexColumn>
                  </Box>
                  <Box title={t("language")}>
                    <LanguageSelector/>
                  </Box>
                  <Divider/>
                  <Box title={t("session")}>
                    <Button fitContent={true} clickAction={() => {
                      window.open(configuration.LOGOUT_URL, '_self')
                    }}>
                      <span>{t("logout")}</span>
                    </Button>
                  </Box>
                  <Divider/>
                  <Box title={t("privacy")}>
                    <Button fitContent={true} clickAction={() => openModal(DeleteAccountModalId)}>
                      <span>{t("delete_account")}</span>
                    </Button>
                  </Box>
                </FlexColumn>
              </div>
            </FlexItem>
            <FlexItem grow={true}/>
          </FlexRow>
        </FlexItem>
      </FlexRow>
      <DeleteAccountModal userEmail={email} onDeleteAccount={() => {
        deleteProfile().then(() => {
          router.push(configuration.LOGOUT_URL);
        }).catch((error) => {
          console.error("Error deleting profile", error);
        });
      }}/>
    </main>
  );
};

export default ProfilePage;
