'use client';

import type {NextPage} from "next";
import React, {useState} from "react";
import Link from "next/link";
import {configuration, paths} from "../../configuration";
import {useRouter} from "next/navigation";
import Button from "../../components/atoms/Button";
import {GoogleIcon} from "../../components/atoms/Icons";
import Divider from "../../components/atoms/Divider";
import {InputType} from "../../components/atoms/InputText";
import FormField from "../../components/molecules/FormField";
import AuthLayout from "../../components/organism/AuthLayout";
import {register} from "../../services/profileService";
import {useTranslations} from "next-intl";

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  passwordRepeat?: string;
}

const Register: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const validate = (): FieldErrors => ({
    firstName: firstName.length === 0 ? t("name_required") : undefined,
    lastName: lastName.length === 0 ? t("last_name_required") : undefined,
    email: email.length === 0 ? t("email_required") : undefined,
    username: username.length < 4
      ? t("username_min_length")
      : username.length > 16 ? t("username_max_length") : undefined,
    password: password.length < 8 ? t("password_min_length") : undefined,
    passwordRepeat: password !== passwordRepeat ? t("passwords_do_not_match") : undefined,
  });

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setSubmitError(undefined);
    const hasErrors = newErrors.firstName || newErrors.lastName || newErrors.email || newErrors.username ||
      newErrors.password || newErrors.passwordRepeat;
    if (hasErrors) {
      return;
    }

    setIsSubmitting(true);
    register(firstName, lastName, username, email, password).then((confirmationRequired) => {
      if (confirmationRequired) {
        router.push(paths.REGISTER_EMAIL_SENT);
      } else {
        router.push(`${paths.LOGIN}?registered=true`);
      }
    }).catch(() => {
      setSubmitError(t("registration_error"));
      setIsSubmitting(false);
    })
  }

  return (
    <AuthLayout
      title={t("new_account")}
      footer={<>
        <p className="text-xs text-base-content/70">
          {t("accept_terms")}{" "}
          <Link className="link" href={configuration.TERMS_OF_SERVICE_URL}>{t("terms_of_service")}</Link>
          {" "}{t("and")}{" "}
          <Link className="link" href={configuration.PRIVACY_POLICY_URL}>{t("privacy_policy")}</Link>
        </p>
        <Link href={paths.LOGIN} className="link link-hover">{t("already_have_account")}</Link>
      </>}
    >
      <Button href={configuration.REGISTER_URL} fitContent={false} primary={false}>
        <GoogleIcon/>{t("register_with_google")}
      </Button>
      <Divider text={t("or")}/>
      <form className="flex flex-col gap-4" onSubmit={handleRegister} noValidate={true}>
        <div className="grid grid-cols-2 gap-3">
          <FormField label={t("name")} placeholder={t("enter_name")} value={firstName} onChange={setFirstName}
                     autoComplete={"given-name"} name={"first-name"} required={true} error={errors.firstName}/>
          <FormField label={t("last_name")} placeholder={t("enter_last_name")} value={lastName} onChange={setLastName}
                     autoComplete={"family-name"} name={"last-name"} required={true} error={errors.lastName}/>
        </div>
        <FormField label={t("email")} placeholder={t("enter_email")} value={email} onChange={setEmail}
                   inputType={InputType.EMAIL} autoComplete={"email"} name={"email"} required={true}
                   error={errors.email}/>
        <FormField label={t("username")} placeholder={t("enter_username")} value={username} onChange={setUsername}
                   autoComplete={"username"} name={"username"} required={true} hint={t("username_hint")}
                   error={errors.username}/>
        <FormField label={t("password")} placeholder={t("enter_password")} value={password} onChange={setPassword}
                   inputType={InputType.PASSWORD} autoComplete={"new-password"} name={"password"} required={true}
                   hint={t("password_hint")} error={errors.password}/>
        <FormField label={t("repeat_password")} placeholder={t("enter_repeat_password")} value={passwordRepeat}
                   onChange={setPasswordRepeat} inputType={InputType.PASSWORD} autoComplete={"new-password"}
                   name={"password-repeat"} required={true} error={errors.passwordRepeat}/>
        {submitError && <p role="alert" className="text-sm text-error">{submitError}</p>}
        <Button submit={true} fitContent={false} disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner loading-xs"/>}
          {t("register")}
        </Button>
      </form>
    </AuthLayout>
  )
};

export default Register;
