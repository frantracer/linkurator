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

const ForgotPassword: NextPage = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = () => {
    forgotPassword(email).then(() => {
      setEmailSent(true);
    });
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
                <span className={"font-bold"}>{"Email"}</span>
                <InputText placeholder={"Introduce tu email"} value={email}
                           onChange={(value) => setEmail(value)}/>
                <Button fitContent={false} clickAction={handleForgotPassword}>
                  {"Restablecer contraseña"}
                </Button>
              </FlexColumn>
            </Box>
            {emailSent &&
                <InfoBanner>
                    <p>{"Se ha enviado un email para restablecer la contraseña"}</p>
                </InfoBanner>
            }
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default ForgotPassword;
