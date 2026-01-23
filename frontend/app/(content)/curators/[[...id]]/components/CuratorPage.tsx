'use client';

import {useTranslations} from 'next-intl';
import React, {useEffect, useState} from "react";
import Button from "../../../../../components/atoms/Button";
import FlexColumn from "../../../../../components/atoms/FlexColumn";
import FlexItem from "../../../../../components/atoms/FlexItem";
import FlexRow from "../../../../../components/atoms/FlexRow";
import {
  AddIcon,
  CrossIcon,
  FunnelIcon,
  MinusIcon,
  OptionsIcon,
  RectangleGroup,
  ShareIcon,
  ThumbsUpFilledIcon
} from "../../../../../components/atoms/Icons";
import {MenuItem} from "../../../../../components/atoms/MenuItem";
import Miniature from "../../../../../components/atoms/Miniature";
import Tag from "../../../../../components/atoms/Tag";
import Drawer from "../../../../../components/molecules/Drawer";
import TopTitle from "../../../../../components/molecules/TopTitle";
import CuratorDetails, {CURATOR_DETAILS_ID} from "../../../../../components/organism/CuratorDetails";
import VideoCardGrid from "../../../../../components/organism/VideoCardGrid";
import {paths} from "../../../../../configuration";
import {useCurator} from "../../../../../hooks/useCurator";
import useCuratorItems from "../../../../../hooks/useCuratorItems";
import {useCurators} from "../../../../../hooks/useCurators";
import {useCuratorTopics} from "../../../../../hooks/useCuratorTopics";
import useFilters from "../../../../../hooks/useFilters";
import useProfile from "../../../../../hooks/useProfile";
import {followCurator, unfollowCurator} from "../../../../../services/curatorService";
import {showLateralMenu} from "../../../../../utilities/lateralMenuAction";
import CuratorTopicsList from "../../../../../components/organism/CuratorTopicsList";
import {Tabs} from "../../../../../components/atoms/Tabs";
import {useTopics} from "../../../../../hooks/useTopics";
import Dropdown from "../../../../../components/atoms/Dropdown";
import Menu from "../../../../../components/atoms/Menu";
import ShareCuratorModal, {ShareCuratorModalId} from "../../../../../components/organism/ShareCuratorModal";
import {openModal} from "../../../../../utilities/modalAction";
import useProviders from "../../../../../hooks/useProviders";

const CuratorPageComponent = ({curatorName}: { curatorName: string }) => {
  const t = useTranslations("common");
  const {providers} = useProviders();

  const {filters, setFilters, resetFilters} = useFilters();
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState<string>(t('recommendations'));
  const {profile, profileIsLoading} = useProfile();
  const {refreshTopics: refreshUserTopics} = useTopics(profile, profileIsLoading);
  const {curators, refreshCurators} = useCurators(profile, profileIsLoading);
  const {curator} = useCurator(curatorName, curators);

  const isUserLogged = !!(profile)
  const isUserCurator = isUserLogged && !!(curator) && profile.username === curator.username;

  const curatorId = curator ? curator.id : null;
  const {
    curatorItems,
    fetchMoreItems,
    refreshCuratorItem,
    isLoading,
    isFinished
  } = useCuratorItems(curatorId, debouncedFilters);

  const {topics, topicsIsLoading, refetchTopics} = useCuratorTopics(curatorId);

  const refreshAllTopics = () => {
    refetchTopics().then(() => {
      refreshUserTopics();
    })
  }

  const curatorThumbnail = curator ? curator.avatar_url : "";

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

  const handleShareCurator = () => {
    openModal(ShareCuratorModalId);
  }

  const dropdownButtons = []
  if (curator) {
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
    dropdownButtons.push(
      <MenuItem key={"curators-filter"} onClick={handleFilter} hideMenuOnClick={true}>
        <FlexRow position="center">
          <FunnelIcon/>
          {t("filter")}
        </FlexRow>
      </MenuItem>
    )
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
                  <Button primary={false} fitContent={true} clickAction={handleFilter} tooltip={t("filter")} hideOnMobile={true}>
                    <FunnelIcon/>
                  </Button>
                </FlexRow>
                <FlexRow>
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
                  {curator && !curator.followed && isUserLogged && !isUserCurator &&
                      <FlexRow>
                          <Button primary={false} clickAction={() => handleFollowCurator(curator.id)}>
                            {t("follow")}
                          </Button>
                      </FlexRow>
                  }
                  {curator && !curator.followed && !isUserLogged &&
                      <FlexRow>
                          <Button primary={false} href={paths.LOGIN}>
                            {t("follow")}
                          </Button>
                      </FlexRow>
                  }
                  {isUserCurator &&
                      <Button primary={false} clickAction={handleShareCurator}>
                          <ShareIcon/>
                        {t("share")}
                      </Button>
                  }
                </FlexRow>
              </FlexColumn>
            </FlexItem>
          </FlexRow>
          <FlexItem grow={true}/>
          {curator &&
              <Dropdown
                  position="end"
                  bottom={true}
                  button={<OptionsIcon/>}
                  borderless={true}
                  closeOnClickInside={true}
              >
                  <Menu>
                    {dropdownButtons}
                  </Menu>
              </Dropdown>
          }
        </FlexRow>
      </TopTitle>

      {/* Mobile tabs */}
      <div className="flex flex-col md:hidden overflow-y-hidden">
        <Tabs tabsText={[t("recommendations"), t("topics")]}
              selectedTab={activeTab}
              onTabSelected={(tab) => setActiveTab(tab)}/>

        {activeTab === t('recommendations') && (
          <div className="p-2 flex w-full h-full overflow-x-hidden overflow-y-auto">
            <VideoCardGrid
              refreshItem={refreshCuratorItem}
              fetchMoreItems={fetchMoreItems}
              items={curatorItems}
              providers={providers}
              showInteractions={isUserLogged}
              isLoading={isLoading}
              isFinished={isFinished}
            />
          </div>
        )}

        {activeTab === t('topics') && (
          <div className="p-2 flex w-full h-full overflow-x-hidden overflow-y-auto">
            <CuratorTopicsList topics={topics} isLoading={topicsIsLoading} refreshTopics={refreshAllTopics}/>
          </div>
        )}
      </div>

      {/* Desktop two-column layout */}
      <div className="hidden flex-col md:grid md:grid-cols-3 h-full overflow-auto">
        <div className="col-span-2 border-r border-neutral h-full overflow-y-auto">
          <FlexColumn gap={4}>
            <FlexRow>
              <ThumbsUpFilledIcon/>
              <h2 className={"text-xl text-balance"}>{t("recommendations")}</h2>
            </FlexRow>
            <VideoCardGrid
              refreshItem={refreshCuratorItem}
              fetchMoreItems={fetchMoreItems}
              items={curatorItems}
              providers={providers}
              showInteractions={isUserLogged}
              isLoading={isLoading}
              isFinished={isFinished}
            />
          </FlexColumn>
        </div>

        <div className="col-span-1 flex w-full h-full overflow-x-hidden overflow-y-auto">
          <div className="w-full items-center mx-4">
            <FlexColumn gap={4}>
              <FlexRow>
                <RectangleGroup/>
                <h2 className="text-xl text-balance">{t("topics")}</h2>
              </FlexRow>
              <CuratorTopicsList topics={topics} isLoading={topicsIsLoading} refreshTopics={refreshAllTopics}/>
            </FlexColumn>
          </div>
        </div>
      </div>
      {curator && (
        <ShareCuratorModal
          curatorName={curatorName}
          curatorUrl={typeof window !== 'undefined' ? window.location.href : ''}
        />
      )}
    </Drawer>
  );
};

export default CuratorPageComponent;
