'use client';

import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from "react";
import Button from "../../../../../components/atoms/Button";
import Dropdown from "../../../../../components/atoms/Dropdown";
import FlexColumn from "../../../../../components/atoms/FlexColumn";
import FlexItem from "../../../../../components/atoms/FlexItem";
import FlexRow from "../../../../../components/atoms/FlexRow";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MenuIcon,
  MinusIcon,
  OptionsIcon,
  ThumbsUpFilledIcon
} from "../../../../../components/atoms/Icons";
import Menu from "../../../../../components/atoms/Menu";
import { MenuItem } from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import CuratorDetails, { CURATOR_DETAILS_ID } from "../../../../../components/organism/CuratorDetails";
import CuratorVideoCardGrid from "../../../../../components/organism/CuratorVideoCardGrid";
import { LATERAL_NAVIGATION_MENU_ID } from "../../../../../components/organism/LateralNavigationMenu";
import { paths } from "../../../../../configuration";
import { useCurator } from "../../../../../hooks/useCurator";
import useCuratorItems from "../../../../../hooks/useCuratorItems";
import { useCurators } from "../../../../../hooks/useCurators";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import { followCurator, unfollowCurator } from "../../../../../services/curatorService";
import { showLateralMenu } from "../../../../../utilities/lateralMenuAction";

const CuratorPageComponent = ({ curatorName }: { curatorName: string }) => {
  const t = useTranslations("common");

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
      <MenuItem key={"curators-filter"} onClick={handleFilter} hideMenuOnClick={true}>
        <FlexRow position="center">
          <FunnelIcon/>
          {t("filter")}
        </FlexRow>
      </MenuItem>
    )
    if (isUserLogged) {
      if (curator.followed) {
        dropdownButtons.push(
          <MenuItem key={"curators-unfollow"} onClick={() => handleUnfollowCurator(curator.id)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <MinusIcon/>
              {t("unfollow")}
            </FlexRow>
          </MenuItem>
        )
      } else {
        dropdownButtons.push(
          <MenuItem key={"curators-follow"} onClick={() => handleFollowCurator(curator.id)} hideMenuOnClick={true}>
            <FlexRow position="center">
              <AddIcon/>
              {t("follow")}
            </FlexRow>
          </MenuItem>
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
        <FlexRow hideOverflow={true}>
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
                      {t("following")}
                      </span>
                        <div className="hover:cursor-pointer" onClick={() => handleUnfollowCurator(curator.id)}>
                            <CrossIcon/>
                        </div>
                    </Tag>
                }
                {curator && !curator.followed && isUserLogged &&
                    <Button primary={false} clickAction={() => handleFollowCurator(curator.id)}>
                      {t("follow")}
                    </Button>
                }
                {curator && !curator.followed && !isUserLogged &&
                    <Button primary={false} href={paths.LOGIN}>
                      {t("follow")}
                    </Button>
                }
              </FlexColumn>
            </FlexItem>
          </FlexRow>
          <FlexItem grow={true}/>
        </FlexRow>
        <Dropdown start={false} bottom={true} button={<OptionsIcon/>}>
          <Menu>
            {dropdownButtons}
          </Menu>
        </Dropdown>
      </TopTitle>
      <FlexRow>
        <ThumbsUpFilledIcon/>
        <h2 className={"text-xl text-balance"}>{t("recommendations")}</h2>
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

export default CuratorPageComponent;
