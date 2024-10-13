'use client';

import type {NextPage} from "next";
import React, {useEffect} from "react";
import useProfile from "../hooks/useProfile";
import {configuration, paths} from "../configuration";
import {useRouter} from "next/navigation";
import Button from "../components/atoms/Button";
import FlexColumn from "../components/atoms/FlexColumn";
import Divider from "../components/atoms/Divider";
import FlexRow from "../components/atoms/FlexRow";
import LinkuratorHeader from "../components/organism/LinkuratorHeader";
import FlexItem from "../components/atoms/FlexItem";

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
          <LinkuratorHeader/>
          <h2 className="text-3xl font-bold py-5">{"Aquí tú decides el contenido que quieres ver"}</h2>
          <p className="py-2">{"Crea categorías para agrupar tus creadores de contenido favoritos"}</p>
          <p className="py-2">{"Filtra el contenido por título o duración"}</p>
          <p className="py-2">{"¡Haz click en estos ejemplos!"}</p>
          <div className="w-full">
            <FlexRow>
              <FlexItem grow={true}>
                <Button href={configuration.EXAMPLE_PROGRAMMING_TOPIC_URL} fitContent={false}>💻️ Programación</Button>
              </FlexItem>
              <FlexItem grow={true}>
                <Button href={configuration.EXAMPLE_VIDEO_GAMES_NEWS_TOPIC_URL} fitContent={false}>🕹️️ Noticias Videojuegos</Button>
              </FlexItem>
            </FlexRow>
          </div>

          <div className="m-8">
            <FlexColumn>
              <Divider/>
              <p>{"¿Tienes cuenta?"}</p>
              <Button href={paths.LOGIN} primary={false} fitContent={false}>Inicia sesión</Button>
              <p>{"¿Todavía no tienes cuenta?"}</p>
              <Button href={paths.REGISTER} fitContent={false}>Regístrate</Button>
            </FlexColumn>
          </div>
        </div>
      </div>
    </main>
  )
};

export default Home;
