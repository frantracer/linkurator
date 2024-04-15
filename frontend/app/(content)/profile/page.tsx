'use client';

import type {NextPage} from "next";
import useProfile from "../../../hooks/useProfile";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";
import {configuration, paths} from "../../../configuration";
import Button from "../../../components/atoms/Button";
import FlexColumn from "../../../components/atoms/FlexColumn";
import TopTitle from "../../../components/molecules/TopTitle";
import FlexRow from "../../../components/atoms/FlexRow";
import Avatar from "../../../components/atoms/Avatar";
import Box from "../../../components/atoms/Box";

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

  const userName = profile ? `${profile.first_name} ${profile.last_name}` : "";
  const email = profile ? profile.email : "";
  const avatarUrl = profile ? profile.avatar_url : "";

  return (
    <main className="min-h-screen bg-base-100">
      <TopTitle>
        <div></div>
        <FlexRow>
          {avatarUrl !== "" && <Avatar src={avatarUrl} alt={userName}></Avatar>}
          <h1>{userName}</h1>
        </FlexRow>
        <div></div>
      </TopTitle>
      <div className={"m-8"}>
        <FlexColumn>
          <Box title={"Name"}>
            <span>{userName}</span>
          </Box>
          <Box title={"Email"}>
            <span>{email}</span>
          </Box>
          <Button fitContent={true} clickAction={() => {
            window.open(configuration.LOGOUT_URL, '_self')
          }}>
            <span>Logout</span>
          </Button>
        </FlexColumn>
      </div>
    </main>
  );
};

export default ProfilePage;
