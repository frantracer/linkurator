'use client';

import type {NextPage} from "next";
import React from "react";
import useProfile from "../../../../hooks/useProfile";
import {useParams} from "next/navigation";
import TopTitle from "../../../../components/molecules/TopTitle";
import Button from "../../../../components/atoms/Button";
import {MenuIcon, OptionsIcon} from "../../../../components/atoms/Icons";
import Avatar from "../../../../components/atoms/Avatar";
import {showLateralMenu} from "../../../../utilities/lateralMenuAction";
import {LATERAL_NAVIGATION_MENU_ID} from "../../../../components/organism/LateralNavigationMenu";
import CuratorVideoCardGrid from "../../../../components/organism/CuratorVideoCardGrid";
import {useCurator} from "../../../../hooks/useCurator";
import useCuratorItems from "../../../../hooks/useCuratorItems";
import CuratorDetails, {CURATOR_DETAILS_ID} from "../../../../components/organism/CuratorDetails";
import Drawer from "../../../../components/molecules/Drawer";
import useFilters from "../../../../hooks/useFilters";
import {useCurators} from "../../../../hooks/useCurators";


const CuratorsPage: NextPage = () => {
  const pathParams = useParams<{ id: string[] | string }>();

  const curatorName: string = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : "";

  const {filters, setFilters, resetFilters} = useFilters();
  const {profile, profileIsLoading} = useProfile();
  const {curators, refreshCurators} = useCurators(profile, profileIsLoading);
  const {curator} = useCurator(curatorName, curators);

  const isUserLogged = !!(profile)

  const curatorId = curator ? curator.id : null;
  const {
    curatorItems,
    fetchMoreItems,
    refreshCuratorItem,
    isLoading,
    isFinished
  } = useCuratorItems(curatorId, filters);

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
    <Drawer id={CURATOR_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <CuratorDetails curator={curator} filters={filters} setFilters={setFilters} resetFilters={resetFilters}
                      refreshCurators={refreshCurators}/>
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
        <Button clickAction={() => showLateralMenu(CURATOR_DETAILS_ID)}>
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
    </Drawer>
  );
};

export default CuratorsPage;
