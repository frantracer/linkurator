'use client';

import type {NextPage} from "next";
import React, {useState} from "react";
import {changePassword} from "../../../../services/profileService";
import {useParams} from "next/navigation";
import Button from "../../../../components/atoms/Button";
import {InputType} from "../../../../components/atoms/InputText";
import FormField from "../../../../components/molecules/FormField";
import AuthLayout from "../../../../components/organism/AuthLayout";
import {paths} from "../../../../configuration";
import {useTranslations} from "next-intl";

const ChangePassword: NextPage = () => {
  const t = useTranslations("common");
  const pathParams = useParams<{ id: string[] | string }>();
  const requestId = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;

  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState<boolean | null>(null);

  const handleChangePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== repeatNewPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    if (requestId !== undefined) {
      changePassword(newPassword, requestId).then(() => {
        setPasswordChanged(true);
      }).catch(() => {
        setPasswordChanged(false);
      })
    }
  }

  return (
    <AuthLayout title={t("reset_password")}>
      {passwordChanged === true
        ? <>
          <p role="status" className="text-sm">{t("password_changed_success")}</p>
          <Button href={paths.LOGIN} fitContent={false}>{t("log_in")}</Button>
        </>
        : <form className="flex flex-col gap-4" onSubmit={handleChangePassword}>
          <FormField label={t("new_password")} placeholder={t("enter_new_password")} value={newPassword}
                     onChange={setNewPassword} inputType={InputType.PASSWORD} autoComplete={"new-password"}
                     required={true} hint={t("password_hint")}/>
          <FormField label={t("repeat_password")} placeholder={t("enter_new_password")} value={repeatNewPassword}
                     onChange={setRepeatNewPassword} inputType={InputType.PASSWORD} autoComplete={"new-password"}
                     required={true} error={mismatch ? t("passwords_do_not_match") : undefined}/>
          {passwordChanged === false && <p role="alert" className="text-sm text-error">{t("password_changed_failure")}</p>}
          <Button submit={true} fitContent={false}>{t("reset_password")}</Button>
        </form>
      }
    </AuthLayout>
  )
};

export default ChangePassword;
