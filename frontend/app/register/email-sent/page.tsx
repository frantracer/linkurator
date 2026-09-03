'use client';

import type {NextPage} from "next";
import FlexColumn from "../../../components/atoms/FlexColumn";
import LinkuratorHeader from "../../../components/organism/LinkuratorHeader";
import React from "react";
import {useTranslations} from "next-intl";

const EmailSent: NextPage = () => {
  const t = useTranslations("common");

  return (
    <main className="hero min-h-dvh bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{t("email_sent_message")}</h2>
            <p>{t("follow_instructions")}</p>
          </FlexColumn>
        </div>
      </div>
    </main>
  );
}

export default EmailSent;