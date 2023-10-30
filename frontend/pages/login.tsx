import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useProfile from "../hooks/useProfile";
import CustomButton from "../components/CustomButton";
import {configuration, paths} from "../configuration";
import {useRouter} from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.TOPICS)
    }
  }, [router, profile, profileIsLoading]);

  const LoginButton = () => {
    return <CustomButton
      text={"Login"}
      icon={undefined}
      relatedModalId={undefined}
      clickAction={() => {
        window.open(configuration.LOGIN_URL, '_self')
      }}/>
  }

  const body =
    <main className="hero min-h-screen bg-gray-200 text-black">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold py-5">Decide the content you want to see</h1>
          <p className="py-2">We do not use any algorithm to recommend you what to see.</p>
          <p className="py-2">We provide the tools you need to find the content you seek.</p>
          <LoginButton/>
        </div>
      </div>
    </main>

  return (
    <div>
      <Head>
        <title>Linkurator</title>
        <meta name="description" content="Linkurator"/>
        <link rel="icon" href="/logo_v1_fav.png"/>
      </Head>
      {body}
    </div>
  );
};

export default Home;
