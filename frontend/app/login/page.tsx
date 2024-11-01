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

const RegisterErrorBanner = () => {
  const searchParams = useSearchParams();
  const loginError = searchParams.get('error');

  if (!loginError) {
    return;
  }

  return (
    <ErrorBanner>
      {"Se requiere una cuenta y dar permisos para acceder a tu cuenta de youtube"}
    </ErrorBanner>
  );
}

const Home: NextPage = () => {
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
      setLoginError("Email o contraseña incorrectos");
    });
  }

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{"Inicia sesión"}</h2>
            <Box>
              <FlexColumn>
                <span className={"font-bold"}>{"Email"}</span>
                <InputText placeholder={"Introduce tu email"} value={email}
                           onChange={(value) => setEmail(value)}/>
                <span className={"font-bold"}>{"Contraseña"}</span>
                <InputText placeholder={"Introduce tu contraseña"} value={password} inputType={InputType.PASSWORD}
                           onChange={(value) => setPassword(value)}/>
                <Button fitContent={false} clickAction={handleLogin}>
                  {"Inicia sesión"}
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
              {"¿Has olvidado tu contraseña?"}
            </ALink>

            <Divider text={"O"}/>

            <Button href={configuration.LOGIN_URL} fitContent={false}><GoogleIcon/>Accede con Google</Button>

            <div className={"h-4"}/>

            <ALink href={paths.REGISTER}>
              <span>¿No tienes cuenta? <b>Regístrate</b></span>
            </ALink>
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default Home;
