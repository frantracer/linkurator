'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import {configuration, paths} from "../../../configuration";
import Head from "next/head";
import Button from "../../../components/atoms/Button";

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const {profile, profileIsLoading} = useProfile();

  useEffect(() => {
    if (!profileIsLoading) {
      if (!profile) {
        router.push(paths.HOME)
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
      <h1>Profile</h1>
      <p>Profile page</p>
      <Button fitContent={true} clickAction={() => {
        window.open(configuration.LOGOUT_URL, '_self')
      }}>
        <span>Logout</span>
      </Button>
    </div>
  );
};

export default ProfilePage;
