'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {paths} from "../../../configuration";
import Head from "next/head";

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
    </div>
  );
};

export default ProfilePage;
