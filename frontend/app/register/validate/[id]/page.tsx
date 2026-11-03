'use client';

import {NextPage} from "next";
import {useParams} from "next/navigation";
import AuthLayout from "../../../../components/organism/AuthLayout";
import React, {useEffect, useState} from "react";
import {validateNewAccountRequest} from "../../../../services/profileService";
import {paths} from "../../../../configuration";
import Button from "../../../../components/atoms/Button";
import {useTranslations} from "next-intl";

const ValidateEmail: NextPage = () => {
  const pathParams = useParams<{ id: string[] | string }>();
  const requestId = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;
  const t = useTranslations("common");

  const [validated, setValidated] = useState<boolean | null>(null);

  useEffect(() => {
    if (requestId) {
      validateNewAccountRequest(requestId).then(() => {
        setValidated(true);
      }).catch(() => {
        setValidated(false);
      })
    }
  }, [requestId]);

  return (
    <AuthLayout title={t("valid_email")}>
      {validated === null &&
          <p role="status" className="flex flex-row items-center gap-2 text-sm">
              <span className="loading loading-spinner loading-sm"/>
            {t("checking")}
          </p>
      }
      {validated === true &&
          <>
              <p role="status" className="text-sm">{t("email_validated")}</p>
              <Button href={paths.LOGIN} fitContent={false}>{t("log_in")}</Button>
          </>
      }
      {validated === false &&
          <>
              <p role="alert" className="text-sm text-error">{t("validation_expired")}</p>
              <div className="flex flex-row gap-2">
                  <Button href={paths.LOGIN} fitContent={false} primary={false}>{t("log_in")}</Button>
                  <Button href={paths.REGISTER} fitContent={false}>{t("sign_up")}</Button>
              </div>
          </>
      }
    </AuthLayout>
  );
}

export default ValidateEmail;