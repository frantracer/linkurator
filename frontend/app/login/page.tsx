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
      It is required to create account and give permissions to access your youtube account
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
          <h2 className="text-3xl font-bold py-5">Here you decide the content you want to see</h2>
          <p className="py-2">Categorize your favorite creators to find their content</p>
          <p className="py-2">Filter the content by title or duration</p>
          <p className="py-2">Check out some examples!</p>
          <div className="w-full">
            <FlexRow>
              <ALink fitContent={false} href={configuration.EXAMPLE_PROGRAMMING_TOPIC_URL}>
                <Button fitContent={false}>💻️ Programming</Button>
              </ALink>
              <ALink fitContent={false} href={configuration.EXAMPLE_VIDEO_GAMES_NEWS_TOPIC_URL}>
                <Button fitContent={false}>🕹️️ Video games News</Button>
              </ALink>
            </FlexRow>
          </div>

          <div className="m-8">
            <FlexColumn>
              <Divider/>
              <p>Do you already have an account?</p>
              <ALink href={configuration.LOGIN_URL}>
                <Button><GoogleIcon/>Sign in with google</Button>
              </ALink>
              <p>{"Don't have an account yet?"}</p>
              <ALink href={configuration.REGISTER_URL}>
                <Button><GoogleIcon/>Sign up with google</Button>
              </ALink>
              <p>
                By signing up, you agree to the &nbsp;
                <ALink href={configuration.TERMS_OF_SERVICE_URL}><b>Terms of Service</b></ALink> and &nbsp;
                <ALink href={configuration.PRIVACY_POLICY_URL}><b>Privacy Policy</b></ALink>
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
