'use client';

import type {NextPage} from "next";
import React from "react";
import useProfile from "../../../../hooks/useProfile";
import {useParams} from "next/navigation";
import TopTitle from "../../../../components/molecules/TopTitle";
import Button from "../../../../components/atoms/Button";
import {MenuIcon, OptionsIcon} from "../../../../components/atoms/Icons";
import Avatar from "../../../../components/atoms/Avatar";
import {SUBSCRIPTION_DETAILS_ID} from "../../../../components/organism/SubscriptionDetails";
import {showLateralMenu} from "../../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../../components/organism/LateralNavigationMenu";
import CuratorVideoCardGrid from "../../../../components/organism/CuratorVideoCardGrid";
import {useCurator} from "../../../../hooks/useCurator";
import useCuratorItems from "../../../../hooks/useCuratorItems";


const CuratorsPage: NextPage = () => {
  const pathParams = useParams<{ id: string[] | string }>();

  const curatorName: string = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : "";

  const {profile} = useProfile();
  const {curator} = useCurator(curatorName);

  const isUserLogged = !!(profile)

  const curatorId = curator ? curator.id : null;
  const {
    curatorItems,
    fetchMoreItems,
    refreshCuratorItem,
    isLoading,
    isFinished
  } = useCuratorItems(curatorId);

  const curatorThumbnail = curator?.avatar_url;

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget
    if (isFinished || isLoading) {
      return
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      fetchMoreItems()
    }
  }

  return (
    <>
      <TopTitle>
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon/>
        </Button>
        <div className="flex flex-row gap-2 items-center justify-center w-full overflow-hidden">
          {curatorThumbnail && <Avatar src={curatorThumbnail} alt={curatorName}/>}
          <h1 className="text-2xl font-bold whitespace-nowrap truncate">
            {curatorName}
          </h1>
        </div>
        <Button clickAction={() => showLateralMenu(SUBSCRIPTION_DETAILS_ID)}>
          <OptionsIcon/>
        </Button>
      </TopTitle>
      <CuratorVideoCardGrid
        refreshItem={refreshCuratorItem}
        fetchMoreItems={fetchMoreItems}
        items={curatorItems}
        showInteractions={isUserLogged}
        isLoading={isLoading}
        isFinished={isFinished}
        handleScroll={handleGridScroll}
      />
    </>
  );
};

export default CuratorsPage;
