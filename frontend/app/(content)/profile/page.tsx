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
import {showLateralMenu} from "../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../components/organism/LateralNavigationMenu";
import {MenuIcon} from "../../../components/atoms/Icons";
import Divider from "../../../components/atoms/Divider";
import {deleteProfile} from "../../../services/profileService";
import DeleteAccountModal, {DeleteAccountModalId} from "../../../components/organism/DeleteAccountModal";
import {openModal} from "../../../utilities/modalAction";

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
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon/>
        </Button>
        <FlexRow position={'center'}>
          {avatarUrl !== "" && <Avatar src={avatarUrl} alt={userName}></Avatar>}
          <h1>{userName}</h1>
        </FlexRow>
      </TopTitle>
      <div className={"m-8"}>
        <FlexColumn>
          <Box title={"Nombre"}>
            <span>{userName}</span>
          </Box>
          <Box title={"Email"}>
            <span>{email}</span>
          </Box>
          <Button fitContent={true} clickAction={() => {
            window.open(configuration.LOGOUT_URL, '_self')
          }}>
            <span>{"Cerrar sesión"}</span>
          </Button>
          <Divider/>
          <Button fitContent={true} clickAction={() => openModal(DeleteAccountModalId)}>
            <span>{"Borrar cuenta"}</span>
          </Button>
        </FlexColumn>
      </div>
      <DeleteAccountModal userEmail={email} onDeleteAccount={() => {
        deleteProfile().then(() => {
          router.push(configuration.LOGOUT_URL);
        }).catch((error) => {
          console.error("Error deleting profile", error);
        });
      }}/>
    </main>
  );
};

export default ProfilePage;
