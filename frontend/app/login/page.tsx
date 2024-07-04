'use client';

import type {NextPage} from "next";
import React, {Suspense, useEffect} from "react";
import useProfile from "../../hooks/useProfile";
import {configuration, paths} from "../../configuration";
import {useRouter, useSearchParams} from "next/navigation";
import Button from "../../components/atoms/Button";
import ALink from "../../components/atoms/ALink";
import FlexColumn from "../../components/atoms/FlexColumn";
import Divider from "../../components/atoms/Divider";
import {GoogleIcon} from "../../components/atoms/Icons";
import {ErrorBanner} from "../../components/atoms/ErrorBanner";
import FlexRow from "../../components/atoms/FlexRow";

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

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.TOPICS)
    }
  }, [router, profile, profileIsLoading]);

  return (
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold py-5 uppercase">
            <img src="/logo_v1_medium.png" alt="Linkurator logo" className="w-20 h-20 inline-block mx-4"/>
            Linkurator
          </h1>
          <h2 className="text-3xl font-bold py-5">{"Aquí tú decides el contenido que quieres ver"}</h2>
          <p className="py-2">{"Crea categorías para agrupar tus creadores de contenido favoritos"}</p>
          <p className="py-2">{"Filtra el contenido por título o duración"}</p>
          <p className="py-2">{"¡Haz click en estos ejemplos!"}</p>
          <div className="w-full">
            <FlexRow>
              <ALink fitContent={false} href={configuration.EXAMPLE_PROGRAMMING_TOPIC_URL}>
                <Button fitContent={false}>💻️ Programación</Button>
              </ALink>
              <ALink fitContent={false} href={configuration.EXAMPLE_VIDEO_GAMES_NEWS_TOPIC_URL}>
                <Button fitContent={false}>🕹️️ Noticias Videojuegos</Button>
              </ALink>
            </FlexRow>
          </div>

          <div className="m-8">
            <FlexColumn>
              <Divider/>
              <p>{"¿Tienes cuenta?"}</p>
              <ALink href={configuration.LOGIN_URL}>
                <Button><GoogleIcon/>Accede con Google</Button>
              </ALink>
              <p>{"¿Todavía no tienes cuenta?"}</p>
              <ALink href={configuration.REGISTER_URL}>
                <Button><GoogleIcon/>Regístrate con Google</Button>
              </ALink>
              <p>
                {"Al registrarte aceptas: "}
                <ALink href={configuration.TERMS_OF_SERVICE_URL}><b>{"Términos del servicio"}</b></ALink> {" y "}
                <ALink href={configuration.PRIVACY_POLICY_URL}><b>{"Política de privacidad"}</b></ALink>
              </p>
              <Suspense>
                <RegisterErrorBanner/>
              </Suspense>
            </FlexColumn>
          </div>
        </div>
      </div>
    </main>
  )
};

export default Home;
