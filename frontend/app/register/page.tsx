'use client';

import type {NextPage} from "next";
import React, {useState} from "react";
import {configuration, paths} from "../../configuration";
import {useRouter} from "next/navigation";
import Button from "../../components/atoms/Button";
import ALink from "../../components/atoms/ALink";
import {GoogleIcon} from "../../components/atoms/Icons";
import Divider from "../../components/atoms/Divider";
import FlexColumn from "../../components/atoms/FlexColumn";
import Box from "../../components/atoms/Box";
import InputText, {InputType} from "../../components/atoms/InputText";
import {ErrorBanner} from "../../components/atoms/ErrorBanner";
import {register} from "../../services/profileService";
import LinkuratorHeader from "../../components/organism/LinkuratorHeader";
import { useTranslations } from "next-intl";

const Home: NextPage = () => {
  const t = useTranslations("common");
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const handleRegister = () => {
    const newErrors: string[] = [];

    if (password !== passwordRepeat) {
      newErrors.push(t("passwords_do_not_match"));
    }

    if (password.length < 8) {
      newErrors.push(t("password_min_length"));
    }

    if (username.length < 4) {
      newErrors.push(t("username_min_length"));
    }

    if (username.length > 16) {
      newErrors.push(t("username_max_length"));
    }

    if (firstName.length === 0) {
      newErrors.push(t("name_required"));
    }

    if (lastName.length === 0) {
      newErrors.push(t("last_name_required"));
    }

    if (email.length === 0) {
      newErrors.push(t("email_required"));
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    register(firstName, lastName, username, email, password).then(() => {
      router.push(paths.REGISTER_EMAIL_SENT);
    }).catch(() => {
      setErrors([t("registration_error")]);
    })
  }

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{t("new_account")}</h2>

            <Button href={configuration.REGISTER_URL} fitContent={false}>
              <GoogleIcon/>{t("register_with_google")}
            </Button>

            <Divider text={t("or")}/>

            {!showForm &&
                <Button fitContent={false} clickAction={() => setShowForm(!showForm)}>
                  {t("register_with_email")}
                </Button>
            }
            {showForm &&
                <Box>
                    <FlexColumn>
                        <span className={"font-bold"}>{t("name")}</span>
                        <InputText placeholder={t("enter_name")} value={firstName}
                                   onChange={(value) => setFirstName(value)}/>
                        <span className={"font-bold"}>{t("last_name")}</span>
                        <InputText placeholder={t("enter_last_name")} value={lastName}
                                   onChange={(value) => setLastName(value)}/>
                        <span className={"font-bold"}>{t("email")}</span>
                        <InputText placeholder={t("enter_email")} value={email}
                                   onChange={(value) => setEmail(value)}/>
                        <span className={"font-bold"}>{t("username")}</span>
                        <InputText placeholder={t("enter_username")} value={username}
                                   onChange={(value) => setUsername(value)}/>
                        <span className={"font-bold"}>{t("password")}</span>
                        <InputText placeholder={t("enter_password")} value={password}
                                   inputType={InputType.PASSWORD}
                                   onChange={(value) => setPassword(value)}/>
                        <span className={"font-bold"}>{t("repeat_password")}</span>
                        <InputText placeholder={t("enter_repeat_password")} value={passwordRepeat}
                                   inputType={InputType.PASSWORD}
                                   onChange={(value) => setPasswordRepeat(value)}/>
                        <Button fitContent={false} clickAction={handleRegister}>
                          {t("register")}
                        </Button>

                      {errors.length > 0 &&
                          <ErrorBanner>
                              <FlexColumn>
                                {errors.map((error) => {
                                  return <span key={error}>{"- " + error}</span>
                                })}
                              </FlexColumn>
                          </ErrorBanner>
                      }
                    </FlexColumn>
                </Box>
            }

            <p>
              {t("accept_terms")}
              <ALink href={configuration.TERMS_OF_SERVICE_URL}><b>{t("terms_of_service")}</b></ALink> {t("and")}
              <ALink href={configuration.PRIVACY_POLICY_URL}><b>{t("privacy_policy")}</b></ALink>
            </p>

            <ALink href={paths.LOGIN}>
              <span>{t("already_have_account")}</span>
            </ALink>
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default Home;
