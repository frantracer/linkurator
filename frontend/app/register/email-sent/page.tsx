'use client';

import type {NextPage} from "next";
import React from "react";
import {useTranslations} from "next-intl";
import AuthLayout from "../../../components/organism/AuthLayout";

const EmailSent: NextPage = () => {
  const t = useTranslations("common");

  return (
    <AuthLayout title={t("email_sent_message")}>
      <p className="text-sm text-base-content/80">{t("follow_instructions")}</p>
    </AuthLayout>
  );
}

export default EmailSent;
