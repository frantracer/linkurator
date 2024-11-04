'use client';

import Drawer from "../../components/molecules/Drawer";
import ThemeToogleButton from "../../components/molecules/ThemeToogleButton";
import TopTitle from "../../components/molecules/TopTitle";
import Button from "../../components/atoms/Button";
import ALink from "../../components/atoms/ALink";
import Head1 from "../../components/atoms/Head1";
import Section from "../../components/atoms/Section";
import SearchBar from "../../components/molecules/SearchBar";
import InputText from "../../components/atoms/InputText";
import {SwapButton} from "../../components/atoms/SwapButton";
import VideoCard from "../../components/organism/VideoCard";
import {
  AddIcon,
  ArchiveBoxFilledIcon,
  ArchiveBoxIcon,
  ArrowUturnLeft,
  BookmarkSquared,
  BookmarkSquaredFilled,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  CheckIcon,
  CircleIcon,
  CrossIcon,
  DownloadIcon,
  ExclamationCircle,
  EyeSlashFilledIcon,
  EyeSlashIcon,
  FunnelIcon,
  GoogleIcon,
  InfoCircleIcon,
  LikeIcon,
  MagnifyingGlassIcon,
  MenuIcon,
  MinusIcon,
  MoonIcon,
  OptionsIcon,
  PencilIcon,
  RectangleGroup,
  RectangleGroupFilled,
  RefreshIcon,
  SunIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon,
  TrashIcon,
  UserIconFilled
} from "../../components/atoms/Icons";
import React, {useEffect} from "react";
import ItemCardSkeleton from "../../components/organism/ItemCardSkeleton";
import Avatar from "../../components/atoms/Avatar";
import Tag from "../../components/atoms/Tag";
import Miniature from "../../components/atoms/Miniature";
import Box from "../../components/atoms/Box";
import Select from "../../components/atoms/Select";
import Menu from "../../components/atoms/Menu";
import {MenuItem} from "../../components/atoms/MenuItem";
import Sidebar from "../../components/atoms/Sidebar";
import Divider from "../../components/atoms/Divider";
import {hideLateralMenu, showLateralMenu} from "../../utilities/lateralMenuAction";
import {ErrorBanner} from "../../components/atoms/ErrorBanner";
import {Tabs} from "../../components/atoms/Tabs";
import Dropdown from "../../components/atoms/Dropdown";
import FlexColumn from "../../components/atoms/FlexColumn";
import FlexRow from "../../components/atoms/FlexRow";

const SIDE_BAR_NAME = "main-menu";
const ICONS_REF = "icons";
const BUTTONS_REF = "buttons";
const SWAP_BUTTONS_REF = "swap_buttons";
const INPUTS_REF = "inputs";
const CARDS_REF = "cards";
const MINIATURES_REF = "miniatures";
const AVATARS_REF = "avatars";
const TAGS_REF = "tags";
const BOX_REF = "box";
const SELECT_REF = "select";
const DROPDOWN_REF = "dropdown";
const ERROR_BANNER_REF = "error_banner";
const TABS_REF = "tabs";

const LateralMenu = (
  {
    closeMenu,
  }: {
    closeMenu: () => void
  }
) => {
  const [anchor, setAnchor] = React.useState<string | null>(null);

  useEffect(() => {
    const currentAnchor = (document.location.hash || "").substring(1);
    setAnchor(currentAnchor);
  }, []);

  const refs = [ICONS_REF, BUTTONS_REF, SWAP_BUTTONS_REF, INPUTS_REF, MINIATURES_REF, AVATARS_REF,
    TAGS_REF, CARDS_REF, BOX_REF, SELECT_REF, DROPDOWN_REF, ERROR_BANNER_REF, TABS_REF];

  const handleClick = (ref: string) => {
    setAnchor(ref);
    closeMenu();
  }

  const replaceUnderscore = (ref: string) => {
    return ref.replace("_", " ");
  }

  const menuItems = refs.map((ref) => {
    return (
      <ALink key={ref} href={"#" + ref}>
        <MenuItem selected={anchor === ref} onClick={() => {
          handleClick(ref)
        }}>
          <span className="uppercase">{replaceUnderscore(ref)}</span>
        </MenuItem>
      </ALink>
    );
  })

  return (
    <Sidebar>
      <div className="flex justify-center items-center p-2">
        <img src="/logo_v1_medium.png" alt="linkurator logo" className="h-8 w-8 mr-2"/>
        <span className="text-2xl font-bold text-center">LINKURATOR</span>
      </div>
      <Divider/>
      <Menu>
        {menuItems}
      </Menu>
    </Sidebar>
  );
}

const IconsSection = () => {
  return (
    <Section>
      <Head1 id={ICONS_REF}># Icons</Head1>
      <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-12 gap-y-8 m-2 py-8 px-4
      rounded border-2 border-base-100 justify-items-center items-center">
        <AddIcon/>
        <MinusIcon/>
        <DownloadIcon/>
        <FunnelIcon/>
        <LikeIcon/>
        <MenuIcon/>
        <MoonIcon/>
        <OptionsIcon/>
        <PencilIcon/>
        <RefreshIcon/>
        <SunIcon/>
        <TrashIcon/>
        <MagnifyingGlassIcon/>
        <ThumbsUpIcon/>
        <ThumbsUpFilledIcon/>
        <ThumbsDownIcon/>
        <ThumbsDownFilledIcon/>
        <CheckCircleIcon/>
        <CheckCircleFilledIcon/>
        <EyeSlashIcon/>
        <EyeSlashFilledIcon/>
        <CrossIcon/>
        <CheckIcon/>
        <RectangleGroup/>
        <RectangleGroupFilled/>
        <BookmarkSquared/>
        <BookmarkSquaredFilled/>
        <ArrowUturnLeft/>
        <ExclamationCircle/>
        <GoogleIcon/>
        <ArchiveBoxIcon/>
        <ArchiveBoxFilledIcon/>
        <UserIconFilled/>
        <InfoCircleIcon/>
        <CircleIcon/>
      </div>
    </Section>
  );
}

const ButtonsSection = () => {
  return (
    <Section>
      <Head1 id={BUTTONS_REF}># Buttons</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <Button><MenuIcon/></Button>
        <Button>Button</Button>
        <Button><DownloadIcon/>Download</Button>
      </div>
    </Section>
  );
}

const SwapButtonsSection = () => {
  return (
    <Section>
      <Head1 id={SWAP_BUTTONS_REF}># Swap Buttons</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <SwapButton defaultChecked={true}>
          <span>ON</span>
          <span>OFF</span>
        </SwapButton>
        <SwapButton defaultChecked={true}>
          <MoonIcon/>
          <SunIcon/>
        </SwapButton>
      </div>
    </Section>
  )
}

const InputsSection = () => {
  return (
    <Section>
      <Head1 id={INPUTS_REF}># Inputs</Head1>
      <div className="flex flex-col gap-4 m-auto p-4 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <div className="grid grid-cols-1 gap-4 w-1/2">
          <InputText/>
          <SearchBar/>
        </div>
      </div>
    </Section>
  );
}

const CardSection = () => {
  const item = {
    uuid: "f857e617-c1e7-4c0d-9982-cb8a2b51de1c",
    name: "Name",
    url: "https://www.linkurator.com",
    thumbnail: "/logo_v1_medium.png",
    published_at: new Date(),
    subscription_uuid: "87484eb4-65cf-4821-b818-2d7e8bbf7488",
    subscription: {
      uuid: "87484eb4-65cf-4821-b818-2d7e8bbf7488",
      name: "Subscription",
      url: "https://www.linkurator.com",
      thumbnail: "/logo_v1_medium.png",
      isBeingScanned: false,
      followed: true,
      topicUuid: "98fbbe67-af08-4954-8249-15ea99e95611"
    },
    recommended: false,
    discouraged: false,
    viewed: false,
    hidden: false,
    duration: 0
  }

  return (
    <Section>
      <Head1 id={CARDS_REF}># Cards</Head1>
      <div className="flex flex-col md:flex-row gap-12 m-auto p-4 w-full
      border-base-100 border-solid border-2 rounded justify-center items-center">
        <ItemCardSkeleton/>
        <VideoCard item={item} onChange={undefined} onChangeSwapButton={async () => {
        }}/>
        <VideoCard item={item} withInteractions={false}/>
      </div>
    </Section>
  );
}

const AvatarsSection = () => {
  return (
    <Section>
      <Head1 id={AVATARS_REF}># Avatar</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <Avatar src={"/logo_v1_medium.png"} alt={"linkurator logo"}/>
      </div>
    </Section>
  );
}

const MiniaturesSection = () => {
  return (
    <Section>
      <Head1 id={MINIATURES_REF}># Miniature</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <Miniature src={"/logo_v1_medium.png"} alt={"linkurator logo"}/>
      </div>
    </Section>
  );
}

const TagSection = () => {
  return (
    <Section>
      <Head1 id={TAGS_REF}># Tags</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <Tag>
          <span>1</span>
        </Tag>
        <Tag>
          <span>Favorites</span>
        </Tag>
        <Tag>
          <Miniature src={"/logo_v1_medium.png"} alt={"linkurator logo"}/>
          <span>Linkurator</span>
        </Tag>
      </div>
    </Section>
  );
}

const BoxSection = () => {
  return (
    <Section>
      <Head1 id={BOX_REF}># Box</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <Box title={"Empty"}/>
        <Box title={"Tags"}>
          <Button>Button</Button>
        </Box>
      </div>
    </Section>
  );
}

const SelectSection = () => {
  return (
    <Section>
      <Head1 id={SELECT_REF}># Select</Head1>
      <div className="flex flex-col gap-6 p-6 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <Select title={"Pick option"} options={
          [
            {key: "1", label: "Option 1"},
            {key: "2", label: "Option 2"},
            {key: "3", label: "Option 3"}
          ]
        } onChange={(key) => console.log(key)}/>
      </div>
    </Section>
  );
}

const DropdownSection = () => {
  const DropdownButton = ({text}: { text: string }) => {
    return (
      <FlexRow>
        <MenuIcon/>
        <span>{text}</span>
      </FlexRow>
    )
  }

  return (
    <Section>
      <Head1># Dropdown</Head1>
      <FlexColumn position={"center"}>
        <Dropdown button={<DropdownButton text={"Bottom start"}/>}>
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
        <Dropdown button={<DropdownButton text={"Bottom end"}/>} start={false}>
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
        <Dropdown button={<DropdownButton text={"Top start"}/>} bottom={false}>
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
        <Dropdown button={<DropdownButton text={"Top end"}/>} bottom={false} start={false}>
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
      </FlexColumn>
    </Section>
  );
}

const ErrorBannerSection = () => {
  return (
    <Section>
      <Head1 id={ERROR_BANNER_REF}># Error Banner</Head1>
      <ErrorBanner>
        Error Banner
      </ErrorBanner>
    </Section>
  );
}

const TabsSection = () => {
  return (
    <Section>
      <Head1># Tabs</Head1>
      <Tabs tabsText={["Tab 1", "Tab 2", "Tab 3"]} selectedTab={"Tab 1"} onTabSelected={(tab) => console.log(tab)}/>
    </Section>
  );
}

const MainContent = () => {
  return (
    <main className="bg-base-300 text-base-content w-full h-full z-0 p-2 overflow-auto">
      <IconsSection/>
      <ButtonsSection/>
      <SwapButtonsSection/>
      <InputsSection/>
      <AvatarsSection/>
      <MiniaturesSection/>
      <TagSection/>
      <CardSection/>
      <BoxSection/>
      <DropdownSection/>
      <SelectSection/>
      <ErrorBannerSection/>
      <TabsSection/>
    </main>
  );
}

const DesignSystemPage = () => {
  return (
    <div className="h-screen w-screen">
      <Drawer id={SIDE_BAR_NAME}>
        <LateralMenu closeMenu={() => hideLateralMenu(SIDE_BAR_NAME)}/>
        <TopTitle>
          <Button clickAction={() => showLateralMenu(SIDE_BAR_NAME)} showOnlyOnMobile={true}>
            <MenuIcon/>
          </Button>
          <h1 className="text-2xl font-bold whitespace-nowrap truncate text-center w-full">
            Design System
          </h1>
          <ThemeToogleButton/>
        </TopTitle>
        <MainContent/>
      </Drawer>
    </div>
  );
}

export default DesignSystemPage;
