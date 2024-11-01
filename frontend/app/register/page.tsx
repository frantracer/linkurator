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

const Home: NextPage = () => {
  const router = useRouter();

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
      newErrors.push("Las contraseñas no coinciden");
    }

    if (password.length < 8) {
      newErrors.push("La contraseña debe tener al menos 8 caracteres");
    }

    if (username.length < 4) {
      newErrors.push("El nombre de usuario debe tener al menos 4 caracteres");
    }

    if (username.length > 16) {
      newErrors.push("El nombre de usuario debe tener como máximo 16 caracteres");
    }

    if (firstName.length === 0) {
      newErrors.push("El nombre no puede estar vacío");
    }

    if (lastName.length === 0) {
      newErrors.push("Los apellidos no pueden estar vacíos");
    }

    if (email.length === 0) {
      newErrors.push("El email no puede estar vacío");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    register(firstName, lastName, username, email, password).then(() => {
      router.push(paths.REGISTER_EMAIL_SENT);
    }).catch(() => {
      setErrors(["Ha ocurrido un error al registrarte"]);
    })
  }

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="max-w-md">
          <LinkuratorHeader/>

          <FlexColumn>
            <h2 className="text-3xl font-bold py-5">{"Nueva cuenta"}</h2>
            <Box>
              <FlexColumn>
                <span className={"font-bold"}>{"Nombre"}</span>
                <InputText placeholder={"Introduce tu nombre"} value={firstName}
                           onChange={(value) => setFirstName(value)}/>
                <span className={"font-bold"}>{"Apellidos"}</span>
                <InputText placeholder={"Introduce tus apellidos"} value={lastName}
                           onChange={(value) => setLastName(value)}/>
                <span className={"font-bold"}>{"Email"}</span>
                <InputText placeholder={"Introduce tu email"} value={email}
                           onChange={(value) => setEmail(value)}/>
                <span className={"font-bold"}>{"Nombre de usuario"}</span>
                <InputText placeholder={"Introduce tu nombre de usuario"} value={username}
                           onChange={(value) => setUsername(value)}/>
                <span className={"font-bold"}>{"Contraseña"}</span>
                <InputText placeholder={"Introduce tu contraseña"} value={password} inputType={InputType.PASSWORD}
                           onChange={(value) => setPassword(value)}/>
                <span className={"font-bold"}>{"Repite la contraseña"}</span>
                <InputText placeholder={"Repite tu contraseña"} value={passwordRepeat} inputType={InputType.PASSWORD}
                           onChange={(value) => setPasswordRepeat(value)}/>
                <p>
                  {"Al registrarte aceptas: "}
                  <ALink href={configuration.TERMS_OF_SERVICE_URL}><b>{"Términos del servicio"}</b></ALink> {" y "}
                  <ALink href={configuration.PRIVACY_POLICY_URL}><b>{"Política de privacidad"}</b></ALink>
                </p>
                <Button fitContent={false} clickAction={handleRegister}>
                  {"Regístrate"}
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

            <ALink href={paths.LOGIN}>
              <span>¿Ya tienes una cuenta? <b>Inicia sesión</b></span>
            </ALink>

            <Divider text={"O"}/>

            <Button href={configuration.REGISTER_URL} fitContent={false}>
              <GoogleIcon/>Regístrate con Google (Beta)
            </Button>
          </FlexColumn>
        </div>
      </div>
    </main>
  )
};

export default Home;
