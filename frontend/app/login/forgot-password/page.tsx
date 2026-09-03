'use client';

import type {NextPage} from "next";
import React, {useState} from "react";
import FlexColumn from "../../../components/atoms/FlexColumn";
import Box from "../../../components/atoms/Box";
import InputText from "../../../components/atoms/InputText";
import Button from "../../../components/atoms/Button";
import LinkuratorHeader from "../../../components/organism/LinkuratorHeader";
import {forgotPassword} from "../../../services/profileService";
import {InfoBanner} from "../../../components/atoms/InfoBanner";
import {useTranslations} from "next-intl";

const ForgotPassword: NextPage = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const t = useTranslations("common");

  const handleForgotPassword = () => {
    forgotPassword(email).then(() => {
      setEmailSent(true);
    });
  }

  return (
    <main className="hero min-h-dvh bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{t("reset_password")}</h2>
            <Box>
              <FlexColumn>
                <span className={"font-bold"}>{t("email")}</span>
                <InputText placeholder={t("enter_email")} value={email}
                           onChange={(value) => setEmail(value)}/>
                <Button fitContent={false} clickAction={handleForgotPassword}>
                  {t("reset_password_button")}
                </Button>
              </FlexColumn>
            </Box>
            {emailSent &&
                <InfoBanner>
                    <p>{t("email_sent")}</p>
                </InfoBanner>
            }
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default ForgotPassword;
