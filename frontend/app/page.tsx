'use client';

import type {NextPage} from "next";
import React, {useEffect} from "react";
import useProfile from "../hooks/useProfile";
import {paths} from "../configuration";
import {useRouter} from "next/navigation";

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
    </div>
  );
};

export default Home;
