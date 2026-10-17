'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import {configuration, paths} from "../../../configuration";
import Button from "../../../components/atoms/Button";
import FlexColumn from "../../../components/atoms/FlexColumn";
import TopTitle from "../../../components/molecules/TopTitle";
import FlexRow from "../../../components/atoms/FlexRow";
import Avatar from "../../../components/atoms/Avatar";
import Box from "../../../components/atoms/Box";
import {deleteProfile, PersonalDataChanges} from "../../../services/profileService";
import DeleteAccountModal, {DeleteAccountModalId} from "../../../components/organism/DeleteAccountModal";
import {openModal} from "../../../utilities/modalAction";
import InputText from "../../../components/atoms/InputText";
import Divider from "../../../components/atoms/Divider";
import FlexItem from "../../../components/atoms/FlexItem";
import {useTranslations} from "next-intl";
import {ProfileIcon} from "../../../components/atoms/Icons";
import {useToast} from "../../../contexts/ToastContext";

const ProfilePage: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {
    profile,
    profileIsLoading,
    updatePersonalData,
    isSavingPersonalData,
    updateUsername,
    isSavingUsername
  } = useProfile();
  const {showToast, showErrorToast} = useToast();

  const email = profile ? profile.email : "";
  const avatarUrl = profile ? profile.avatar_url : "";

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const hasFirstNameChanged = profile != null && firstName !== null && firstName !== profile.first_name;
  const hasLastNameChanged = profile != null && lastName !== null && lastName !== profile.last_name;
  const hasPersonalDataChanges = hasFirstNameChanged || hasLastNameChanged;
  const hasUsernameChanged = profile != null && username !== null && username !== profile.username;

  const handleSavePersonalData = () => {
    const changes: PersonalDataChanges = {
      first_name: hasFirstNameChanged && firstName !== null ? firstName : undefined,
      last_name: hasLastNameChanged && lastName !== null ? lastName : undefined,
    };
    updatePersonalData(changes, {
      onSuccess: () => showToast(t("personal_data_saved_successfully")),
      onError: () => showErrorToast(t("error_saving_personal_data")),
    });
  };

  const handleSaveUsername = () => {
    if (username === null) {
      return;
    }
    updateUsername(username, {
      onSuccess: (result) => {
        if (result === "already_in_use") {
          showErrorToast(t("username_already_in_use", {username: username}));
          return;
        }
        showToast(t("username_changed_successfully"));
      },
      onError: () => showErrorToast(t("error_changing_username")),
    });
  };

  // Redirect to login if not logged in
  useEffect(() => {
    if (!profileIsLoading) {
      if (!profile) {
        router.push(paths.LANDING)
      } else {
        setFirstName(profile.first_name);
        setLastName(profile.last_name);
        setUsername(profile.username);
      }
    }
  }, [profileIsLoading, router, profile]);

  return (
    <main className="flex flex-col h-full bg-base-200">
      <TopTitle>
        <div className="flex flex-row items-center h-full w-full px-4">
          <div className="w-10 shrink-0 flex items-center justify-start"/>
          <h1 className="text-xl font-bold flex-1 min-w-0 flex items-center justify-center gap-2">
            <ProfileIcon/>
            {t("my_profile")}
          </h1>
          <div className="w-10 shrink-0"/>
        </div>
      </TopTitle>
      <div className="h-full overflow-y-auto">
        <FlexRow position={"center"}>
          <FlexItem grow={true}>
            <FlexRow>
              <FlexItem grow={true}/>
              <FlexItem grow={true}>
                <div className={"px-2 py-4 min-w-80"}>
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
                        <span className={"font-bold"}>{t("last_name")}</span>
                        <InputText value={lastName === null ? "" : lastName} onChange={(value) => {
                          setLastName(value)
                        }}/>
                        <Button fitContent={true} clickAction={handleSavePersonalData}
                                disabled={!hasPersonalDataChanges || isSavingPersonalData}>
                          {t("save")}
                        </Button>
                      </FlexColumn>
                    </Box>
                    <Box title={t("account_data")}>
                      <FlexColumn>
                        <span className={"font-bold"}>{t("email")}</span>
                        <InputText value={email} disabled={true}/>
                        <span className={"font-bold"}>{t("username")}</span>
                        <InputText value={username === null ? "" : username} onChange={(value) => {
                          setUsername(value.toLowerCase())
                        }}/>
                        <Button fitContent={true} clickAction={handleSaveUsername}
                                disabled={!hasUsernameChanged || isSavingUsername}>
                          {t("save")}
                        </Button>
                      </FlexColumn>
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
      </div>
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
