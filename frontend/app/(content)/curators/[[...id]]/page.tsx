'use client';

import type {NextPage} from "next";
import React from "react";
import useProfile from "../../../../hooks/useProfile";
import {useParams} from "next/navigation";
import TopTitle from "../../../../components/molecules/TopTitle";
import Button from "../../../../components/atoms/Button";
import {CrossIcon, MenuIcon, OptionsIcon} from "../../../../components/atoms/Icons";
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
import FlexRow from "../../../../components/atoms/FlexRow";
import FlexItem from "../../../../components/atoms/FlexItem";
import Tag from "../../../../components/atoms/Tag";
import {followCurator, unfollowCurator} from "../../../../services/curatorService";


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

  const handleFollowCurator = (curatorId: string) => {
    followCurator(curatorId).then(() => {
      refreshCurators()
    })
  }

  const handleUnfollowCurator = (curatorId: string) => {
    unfollowCurator(curatorId).then(() => {
      refreshCurators()
    })
  }

  return (
    <Drawer id={CURATOR_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <CuratorDetails curator={curator} filters={filters} setFilters={setFilters} resetFilters={resetFilters}
                      refreshCurators={refreshCurators}/>
      <TopTitle>
        <FlexRow>
          <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
            <MenuIcon/>
          </Button>
          <FlexItem grow={true}/>
          {curatorThumbnail && <Avatar src={curatorThumbnail} alt={curatorName}/>}
          <h1 className="text-2xl font-bold truncate">
            {curatorName}
          </h1>
          {curator && curator.followed &&
              <FlexItem>
                  <Tag>
                    {"Siguiendo"}
                      <div className="hover:cursor-pointer" onClick={() => handleUnfollowCurator(curator.id)}>
                          <CrossIcon/>
                      </div>
                  </Tag>
              </FlexItem>
          }
          {curator && !curator.followed &&
              <FlexItem>
                  <Button primary={false} clickAction={() => handleFollowCurator(curator.id)}>
                    {"Seguir"}
                  </Button>
              </FlexItem>
          }
          <FlexItem grow={true}/>
          <Button clickAction={() => showLateralMenu(CURATOR_DETAILS_ID)}>
            <OptionsIcon/>
          </Button>
        </FlexRow>
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
