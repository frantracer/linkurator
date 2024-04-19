'use client';

import type {NextPage} from "next";
import React, {useEffect} from "react";
import useProfile from "../../hooks/useProfile";
import {configuration, paths} from "../../configuration";
import {useRouter} from "next/navigation";
import Button from "../../components/atoms/Button";
import ALink from "../../components/atoms/ALink";

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
          <h2 className="text-3xl font-bold py-5">Here you decide the content you want to see</h2>
          <p className="py-2">We do not use any algorithm to recommend you what to see.</p>
          <p className="py-2">We provide the tools you need to find the content you seek.</p>
          <div className="m-8">
            <ALink href={configuration.LOGIN_URL}>
              <Button>Login</Button>
            </ALink>
          </div>
        </div>
      </div>
    </main>
  )
};

export default Home;
