'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import {configuration, paths} from "../../../configuration";
import Button from "../../../components/atoms/Button";
import PageHeader from "../../../components/molecules/PageHeader";
import FormField from "../../../components/molecules/FormField";
import SettingsSection from "../../../components/molecules/SettingsSection";
import {InputType} from "../../../components/atoms/InputText";
import Avatar from "../../../components/atoms/Avatar";
import {deleteProfile, PersonalDataChanges} from "../../../services/profileService";
import ConfirmDialog from "../../../components/organism/ConfirmDialog";
import {openModal} from "../../../utilities/modalAction";
import {useTranslations} from "next-intl";
import {ProfileIcon} from "../../../components/atoms/Icons";
import {useToast} from "../../../contexts/ToastContext";

const DeleteAccountDialogId = "delete-account-dialog";

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
    <main className="flex flex-col h-full bg-base-300">
      <PageHeader title={t("my_profile")} icon={<ProfileIcon/>}/>
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto px-4 py-6">
          <SettingsSection title={t("personal_data")}>
            <div className="flex flex-row items-center gap-4">
              <Avatar src={avatarUrl} alt={t("profile_picture")} size={"lg"}/>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold truncate">{profile?.first_name} {profile?.last_name}</span>
                <span className="text-sm text-base-content/60 truncate">@{profile?.username}</span>
              </div>
            </div>
            <form className="flex flex-col gap-4" onSubmit={(event) => {
              event.preventDefault();
              handleSavePersonalData();
            }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label={t("first_name")} value={firstName === null ? "" : firstName}
                           onChange={setFirstName} autoComplete={"given-name"}/>
                <FormField label={t("last_name")} value={lastName === null ? "" : lastName}
                           onChange={setLastName} autoComplete={"family-name"}/>
              </div>
              <div className="flex justify-end">
                <Button submit={true} disabled={!hasPersonalDataChanges || isSavingPersonalData}>
                  {t("save")}
                </Button>
              </div>
            </form>
          </SettingsSection>
          <SettingsSection title={t("account_data")}>
            <form className="flex flex-col gap-4" onSubmit={(event) => {
              event.preventDefault();
              handleSaveUsername();
            }}>
              <FormField label={t("email")} value={email} onChange={() => undefined} disabled={true}
                         inputType={InputType.EMAIL}/>
              <FormField label={t("username")} value={username === null ? "" : username}
                         onChange={(value) => setUsername(value.toLowerCase())} autoComplete={"username"}
                         hint={t("username_hint")}/>
              <div className="flex justify-end">
                <Button submit={true} disabled={!hasUsernameChanged || isSavingUsername}>
                  {t("save")}
                </Button>
              </div>
            </form>
          </SettingsSection>
          <SettingsSection title={t("danger_zone")} description={t("delete_account_warning")} danger={true}>
            <div>
              <Button danger={true} clickAction={() => openModal(DeleteAccountDialogId)}>
                {t("delete_account")}
              </Button>
            </div>
          </SettingsSection>
        </div>
      </div>
      <ConfirmDialog
        id={DeleteAccountDialogId}
        title={t("delete_account_title")}
        message={t("delete_account_warning")}
        confirmLabel={t("delete")}
        errorMessage={t("delete_account_failed")}
        confirmationText={email}
        confirmationInstruction={t("delete_account_instruction")}
        onConfirm={async () => {
          await deleteProfile();
          router.push(configuration.LOGOUT_URL);
        }}
      />
    </main>
  );
};

export default ProfilePage;
