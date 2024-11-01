'use client';

import type {NextPage} from "next";
import React, {useEffect, useState} from "react";
import useProfile from "../../../../hooks/useProfile";
import {useParams} from "next/navigation";
import TopTitle from "../../../../components/molecules/TopTitle";
import Button from "../../../../components/atoms/Button";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MenuIcon,
  MinusIcon,
  OptionsIcon,
  ThumbsUpFilledIcon
} from "../../../../components/atoms/Icons";
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
import Dropdown from "../../../../components/atoms/Dropdown";
import FlexColumn from "../../../../components/atoms/FlexColumn";
import Miniature from "../../../../components/atoms/Miniature";


const CuratorsPage: NextPage = () => {
  const pathParams = useParams<{ id: string[] | string }>();

  const curatorName: string = pathParams.id ? (Array.isArray(pathParams.id) ? pathParams.id[0] : pathParams.id) : "";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
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
  } = useCuratorItems(curatorId, debouncedFilters);

  const curatorThumbnail = curator ? curator.avatar_url : "";

  const handleGridScroll = (event: React.UIEvent<HTMLElement>) => {
    const element = event.currentTarget
    if (isFinished || isLoading) {
      return
    }
    if ((element.scrollTop + element.clientHeight) / element.scrollHeight >= 0.90) {
      fetchMoreItems()
    }
  }

  const handleFilter = () => {
    showLateralMenu(CURATOR_DETAILS_ID);
    setDropdownOpen(false);
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

  const dropdownButtons = []
  if (curator) {
    dropdownButtons.push(
      <Button key={"curators-filter"}
              fitContent={false} clickAction={handleFilter}>
        <FunnelIcon/>
        {"Filtrar"}
      </Button>
    )
    if (isUserLogged) {
      if (curator.followed) {
        dropdownButtons.push(
          <Button key={"curators-unfollow"}
                  fitContent={false} clickAction={() => handleUnfollowCurator(curator.id)}>
            <MinusIcon/>
            {"Dejar de seguir"}
          </Button>
        )
      } else {
        dropdownButtons.push(
          <Button key={"curators-follow"}
                  fitContent={false} clickAction={() => handleFollowCurator(curator.id)}>
            <AddIcon/>
            {"Seguir"}
          </Button>
        )
      }
    }
  }

  useEffect(() => {
    if (filters.textSearch === debouncedFilters.textSearch) {
      setDebouncedFilters(filters)
    } else {
      const timer = setTimeout(() => {
        setDebouncedFilters(filters)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [debouncedFilters.textSearch, filters]);

  return (
    <Drawer id={CURATOR_DETAILS_ID} right={true} alwaysOpenOnDesktop={false}>
      <CuratorDetails curator={curator} filters={filters} setFilters={setFilters} resetFilters={resetFilters}/>
      <TopTitle>
        <Button clickAction={() => showLateralMenu(LATERAL_NAVIGATION_MENU_ID)} showOnlyOnMobile={true}>
          <MenuIcon/>
        </Button>
        <FlexRow>
          <FlexItem grow={true}/>
          <FlexRow>
            <FlexItem>
              <FlexColumn gap={0} position={"center"}>
                <FlexRow>
                  <Miniature src={curatorThumbnail} alt={curatorName}/>
                  <h1 className="text-xl font-bold whitespace-nowrap truncate">
                    {curatorName}
                  </h1>
                </FlexRow>
                {curator && curator.followed &&
                    <Tag>
                      <span>
                      {"Siguiendo"}
                      </span>
                        <div className="hover:cursor-pointer" onClick={() => handleUnfollowCurator(curator.id)}>
                            <CrossIcon/>
                        </div>
                    </Tag>
                }
                {curator && !curator.followed &&
                    <Button primary={false} clickAction={() => handleFollowCurator(curator.id)}>
                      {"Seguir"}
                    </Button>
                }
              </FlexColumn>
            </FlexItem>
          </FlexRow>
          <FlexItem grow={true}/>
        </FlexRow>
        <Dropdown start={false} bottom={true} button={<OptionsIcon/>} open={dropdownOpen}
                  onChange={(open) => setDropdownOpen(open)}>
          {dropdownButtons}
        </Dropdown>
      </TopTitle>
      <FlexRow>
        <ThumbsUpFilledIcon/>
        <h2 className={"text-xl"}>{"Recomendaciones de "}</h2>
        <h2 className={"text-xl font-bold"}>{curatorName}</h2>
      </FlexRow>
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
