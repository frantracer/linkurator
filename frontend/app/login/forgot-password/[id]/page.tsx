'use client';

import type {NextPage} from "next";
import React, {useState} from "react";
import {changePassword} from "../../../../services/profileService";
import {useParams, useRouter} from "next/navigation";
import LinkuratorHeader from "../../../../components/organism/LinkuratorHeader";
import FlexColumn from "../../../../components/atoms/FlexColumn";
import Box from "../../../../components/atoms/Box";
import InputText, {InputType} from "../../../../components/atoms/InputText";
import Button from "../../../../components/atoms/Button";
import {InfoBanner} from "../../../../components/atoms/InfoBanner";
import {ErrorBanner} from "../../../../components/atoms/ErrorBanner";
import {paths} from "../../../../configuration";

const ChangePassword: NextPage = () => {
  const router = useRouter();
  const pathParams = useParams<{ id: string[] | string }>();
  const requestId = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : undefined;

  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");
  const [passwordChanged, setPasswordChanged] = useState<boolean | null>(null);

  const handleChangePassword = () => {
    if (newPassword !== repeatNewPassword) {
      setPasswordChanged(false);
    }

    if (requestId !== undefined) {
      changePassword(newPassword, requestId).then(() => {
        setPasswordChanged(true);
      }).catch(() => {
        setPasswordChanged(false);
      })
    }
  }

  const goToLogin = () => {
    router.push(paths.LOGIN);
  }

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{"Restablece tu contraseña"}</h2>
            <Box>
              <FlexColumn>
                <span className={"font-bold"}>{"Nueva contraseña"}</span>
                <InputText placeholder={"Introduce tu contraseña"} value={newPassword}
                           inputType={InputType.PASSWORD}
                           onChange={(value) => setNewPassword(value)}/>
                <span className={"font-bold"}>{"Repite la contraseña"}</span>
                <InputText placeholder={"Introduce tu contraseña"} value={repeatNewPassword}
                           inputType={InputType.PASSWORD}
                           onChange={(value) => setRepeatNewPassword(value)}/>
                <Button fitContent={false} clickAction={handleChangePassword}>
                  {"Restablecer contraseña"}
                </Button>
              </FlexColumn>
            </Box>
            {passwordChanged === true &&
                <FlexColumn>
                    <InfoBanner>
                        <p>{"Se ha cambiado la contraseña satisfactoriamente"}</p>
                    </InfoBanner>
                    <Button fitContent={false} clickAction={goToLogin}>
                      {"Iniciar sesión"}
                    </Button>
                </FlexColumn>
            }
            {passwordChanged === false &&
                <ErrorBanner>
                    <p>{"No se ha podido cambiar la contraseña"}</p>
                </ErrorBanner>
            }
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default ChangePassword;
