'use client';

import type {NextPage} from "next";
import React, {Suspense, useEffect, useState} from "react";
import Link from "next/link";
import useProfile from "../../hooks/useProfile";
import {configuration, paths} from "../../configuration";
import {useRouter, useSearchParams} from "next/navigation";
import {useQueryClient} from "@tanstack/react-query";
import Button from "../../components/atoms/Button";
import {GoogleIcon} from "../../components/atoms/Icons";
import Divider from "../../components/atoms/Divider";
import {InputType} from "../../components/atoms/InputText";
import FormField from "../../components/molecules/FormField";
import AuthLayout from "../../components/organism/AuthLayout";
import {login} from "../../services/profileService";
import {useTranslations} from 'next-intl';

const LoginNotices = () => {
  const t = useTranslations("common");
  const searchParams = useSearchParams();

  return (
    <>
      {searchParams.get('error') &&
          <p role="alert" className="text-sm text-error">{t("you_must_sign_up")}</p>
      }
      {searchParams.get('registered') &&
          <p role="status" className="text-sm text-primary">{t("account_created")}</p>
      }
    </>
  );
}

const Login: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.HOME)
    }
  }, [router, profile, profileIsLoading]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginError(undefined);
    login(email, password).then(() => {
      queryClient.removeQueries({queryKey: ['profile']});
      router.push(paths.HOME);
    }).catch(() => {
      setLoginError(t("incorrect_email_or_password"));
      setIsSubmitting(false);
    });
  }

  return (
    <AuthLayout
      title={t("log_in")}
      footer={
        <Link href={paths.REGISTER} className="link link-hover">
          {t("no_account_sign_up")} <b>{t("sign_up")}</b>
        </Link>
      }
    >
      <Suspense>
        <LoginNotices/>
      </Suspense>
      <Button href={configuration.LOGIN_URL} fitContent={false} primary={false}>
        <GoogleIcon/>{t("log_in_with_google")}
      </Button>
      <Divider text={t("or")}/>
      <form className="flex flex-col gap-4" onSubmit={handleLogin}>
        <FormField label={t("email")} placeholder={t("insert_email")} value={email} onChange={setEmail}
                   inputType={InputType.EMAIL} autoComplete={"email"} name={"email"} required={true}/>
        <FormField label={t("password")} placeholder={t("enter_password")} value={password} onChange={setPassword}
                   inputType={InputType.PASSWORD} autoComplete={"current-password"} name={"password"}
                   required={true} error={loginError}/>
        <Link href={paths.FORGOT_PASSWORD} className="self-end -mt-2 text-xs link link-hover text-base-content/70">
          {t("forgot_password")}
        </Link>
        <Button submit={true} fitContent={false} disabled={isSubmitting}>
          {isSubmitting && <span className="loading loading-spinner loading-xs"/>}
          {t("log_in")}
        </Button>
      </form>
    </AuthLayout>
  )
};

export default Login;
