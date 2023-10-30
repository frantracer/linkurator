import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useProfile from "../hooks/useProfile";
import {paths} from "../configuration";
import {useRouter} from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  useEffect(() => {
    if (!profileIsLoading) {
      if (profile) {
        router.push(paths.TOPICS)
      } else {
        router.push(paths.LOGIN)
      }
    }
  }, [profileIsLoading, router, profile]);

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/logo_v1_fav.png"/>
      </Head>
    </div>
  );
};

export default Home;
