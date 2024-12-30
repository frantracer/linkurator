'use client';

import type {NextPage} from "next";
import React, {Suspense, useEffect, useState} from "react";
import useProfile from "../../hooks/useProfile";
import {configuration, paths} from "../../configuration";
import {useRouter, useSearchParams} from "next/navigation";
import Button from "../../components/atoms/Button";
import ALink from "../../components/atoms/ALink";
import {GoogleIcon} from "../../components/atoms/Icons";
import Divider from "../../components/atoms/Divider";
import FlexColumn from "../../components/atoms/FlexColumn";
import Box from "../../components/atoms/Box";
import InputText, {InputType} from "../../components/atoms/InputText";
import {login} from "../../services/profileService";
import {ErrorBanner} from "../../components/atoms/ErrorBanner";
import LinkuratorHeader from "../../components/organism/LinkuratorHeader";
import {useTranslations} from 'next-intl';

const RegisterErrorBanner = () => {
  const t = useTranslations("common");

  const searchParams = useSearchParams();
  const loginError = searchParams.get('error');

  if (!loginError) {
    return;
  }

  return (
    <ErrorBanner>
      {t("you_must_sign_up")}
    </ErrorBanner>
  );
}

const Home: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.TOPICS)
    }
  }, [router, profile, profileIsLoading]);

  const handleLogin = () => {
    login(email, password).then(() => {
      router.push(paths.TOPICS);
    }).catch(() => {
      setLoginError(t("incorrect_email_or_password"));
    });
  }

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>
          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{t("log_in")}</h2>
            <Button href={configuration.LOGIN_URL} fitContent={false}><GoogleIcon/>{t("log_in_with_google")}</Button>

            <Divider text={t("or")}/>

            <Box>
              <FlexColumn>
                <span className={"font-bold"}>{t("email")}</span>
                <InputText placeholder={t("insert_email")} value={email}
                           onChange={(value) => setEmail(value)}/>
                <span className={"font-bold"}>{t("password")}</span>
                <InputText placeholder={t("enter_password")} value={password} inputType={InputType.PASSWORD}
                           onChange={(value) => setPassword(value)}/>
                <Button fitContent={false} clickAction={handleLogin}>
                  {t("log_in")}
                </Button>
                {loginError &&
                    <ErrorBanner>
                        <FlexColumn>
                            <span>{loginError}</span>
                        </FlexColumn>
                    </ErrorBanner>
                }
              </FlexColumn>
            </Box>

            <Suspense>
              <RegisterErrorBanner/>
            </Suspense>

            <ALink href={paths.FORGOT_PASSWORD}>
              {t("forgot_password")}
            </ALink>

            <div className={"h-4"}/>

            <ALink href={paths.REGISTER}>
              <span>{t("no_account_sign_up")} <b>{t("sign_up")}</b></span>
            </ALink>
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default Home;
