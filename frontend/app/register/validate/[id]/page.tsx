'use client';

import {NextPage} from "next";
import {useParams, useRouter} from "next/navigation";
import FlexColumn from "../../../../components/atoms/FlexColumn";
import React, {useEffect, useState} from "react";
import {validateNewAccountRequest} from "../../../../services/profileService";
import LinkuratorHeader from "../../../../components/organism/LinkuratorHeader";
import {Spinner} from "../../../../components/atoms/Spinner";
import FlexRow from "../../../../components/atoms/FlexRow";
import {InfoBanner} from "../../../../components/atoms/InfoBanner";
import {paths} from "../../../../configuration";
import {ErrorBanner} from "../../../../components/atoms/ErrorBanner";
import Button from "../../../../components/atoms/Button";
import FlexItem from "../../../../components/atoms/FlexItem";
import {useTranslations} from "next-intl";

const ValidateEmail: NextPage = () => {
  const router = useRouter();
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

  const goToLogin = () => {
    router.push(paths.LOGIN);
  }

  const goToRegister = () => {
    router.push(paths.REGISTER);
  }

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-2xl font-bold py-5">{t("valid_email")}</h2>
            {validated === null &&
                <FlexRow>
                    <Spinner/>
                    <p>{t("checking")}</p>
                </FlexRow>
            }
            {validated === true &&
                <>
                    <InfoBanner>
                        <p>{t("email_validated")}</p>
                    </InfoBanner>
                    <Button clickAction={goToLogin}>{t("log_in")}</Button>
                </>
            }
            {validated === false &&
                <>
                    <ErrorBanner>
                        <FlexColumn>
                            <p>{t("validation_expired")}</p>
                        </FlexColumn>
                    </ErrorBanner>
                    <FlexRow>
                        <FlexItem grow={true}>
                            <Button fitContent={false} primary={false} clickAction={goToLogin}>{t("log_in")}</Button>
                        </FlexItem>
                        <FlexItem grow={true}>
                            <Button fitContent={false} clickAction={goToRegister}>{t("sign_up")}</Button>
                        </FlexItem>
                    </FlexRow>
                </>
            }
          </FlexColumn>
        </div>
      </div>
    </main>
  );
}

export default ValidateEmail;