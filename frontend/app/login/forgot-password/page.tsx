'use client';

import type {NextPage} from "next";
import React, {useState} from "react";
import Link from "next/link";
import Button from "../../../components/atoms/Button";
import {InputType} from "../../../components/atoms/InputText";
import FormField from "../../../components/molecules/FormField";
import AuthLayout from "../../../components/organism/AuthLayout";
import {forgotPassword} from "../../../services/profileService";
import {paths} from "../../../configuration";
import {useTranslations} from "next-intl";

const ForgotPassword: NextPage = () => {
  const t = useTranslations("common");
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleForgotPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    forgotPassword(email).then(() => {
      setEmailSent(true);
    }).finally(() => {
      setIsSubmitting(false);
    });
  }

  return (
    <AuthLayout
      title={t("reset_password")}
      footer={<Link href={paths.LOGIN} className="link link-hover">{t("log_in")}</Link>}
    >
      {emailSent
        ? <p role="status" className="text-sm">{t("email_sent")}</p>
        : <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
          <FormField label={t("email")} placeholder={t("enter_email")} value={email} onChange={setEmail}
                     inputType={InputType.EMAIL} autoComplete={"email"} name={"email"} required={true}/>
          <Button submit={true} fitContent={false} disabled={isSubmitting || email.length === 0}>
            {t("reset_password_button")}
          </Button>
        </form>
      }
    </AuthLayout>
  )
};

export default ForgotPassword;
