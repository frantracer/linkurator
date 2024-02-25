import type {NextPage} from "next";
import Head from "next/head";
import React, {useEffect} from "react";
import "tailwindcss/tailwind.css";
import useProfile from "../hooks/useProfile";
import {configuration, paths} from "../configuration";
import {useRouter} from "next/router";
import Button from "../components/atoms/Button";

const Home: NextPage = () => {
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  useEffect(() => {
    if (!profileIsLoading && profile) {
      router.push(paths.TOPICS)
    }
  }, [router, profile, profileIsLoading]);

  const LoginButton = () => {
    return (
      <Button
        clickAction={() => {
          window.open(configuration.LOGIN_URL, '_self')
        }}>
        Login
      </Button>
    )
  }

  const body =
    <main className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold py-5 uppercase">
            <img src="/logo_v1_medium.png" alt="Linkurator logo" className="w-20 h-20 inline-block mx-4"/>
            Linkurator
          </h1>
          <h2 className="text-3xl font-bold py-5">Here you decide the content you want to see</h2>
          <p className="py-2">We do not use any algorithm to recommend you what to see.</p>
          <p className="py-2">We provide the tools you need to find the content you seek.</p>
          <div className="m-8">
            <LoginButton/>
          </div>
        </div>
      </div>
    </main>

  return (
    <html>
    <Head>
      <title>Linkurator</title>
      <meta name="description" content="Linkurator"/>
      <link rel="icon" href="/logo_v1_fav.png"/>
    </Head>
    {body}
    </html>
  );
};

export default Home;
