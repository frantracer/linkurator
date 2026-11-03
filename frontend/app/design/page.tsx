'use client';

import Drawer from "../../components/molecules/Drawer";
import ThemeToggleButton from "../../components/molecules/ThemeToggleButton";
import PageHeader from "../../components/molecules/PageHeader";
import Button from "../../components/atoms/Button";
import FollowToggleButton from "../../components/molecules/FollowToggleButton";
import TopicIcon from "../../components/atoms/TopicIcon";
import EmptyStateBox from "../../components/atoms/EmptyStateBox";
import EndOfList from "../../components/atoms/EndOfList";
import ALink from "../../components/atoms/ALink";
import Head1 from "../../components/atoms/Head1";
import Section from "../../components/atoms/Section";
import SearchBar from "../../components/molecules/SearchBar";
import InputText from "../../components/atoms/InputText";
import ContentItemCard from "../../components/organism/ContentItemCard";
import {
  AddIcon,
  ArchiveBoxFilledIcon,
  ArchiveBoxIcon,
  ArrowUturnLeft,
  BoltIcon,
  ChatBubbleIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  CrossIcon,
  CuratorIcon,
  DownloadIcon,
  ExclamationCircle,
  EyeSlashFilledIcon,
  EyeSlashIcon,
  FunnelIcon,
  GoogleIcon,
  HomeIcon,
  ImportIcon,
  InfoCircleIcon,
  LikeIcon,
  LinkedinIcon,
  MagnifyingGlassIcon,
  MenuIcon,
  MinusIcon,
  MoonIcon,
  OptionsIcon,
  PencilIcon,
  ProfileIcon,
  RectangleGroup,
  RectangleGroupFilled,
  RefreshIcon,
  SettingsIcon,
  ShareIcon,
  StarFilledIcon,
  StarIcon,
  SubscriptionIcon,
  SunIcon,
  ThumbsDownFilledIcon,
  ThumbsDownIcon,
  ThumbsUpFilledIcon,
  ThumbsUpIcon,
  TrashIcon,
  TwitterIcon
} from "../../components/atoms/Icons";
import React, {useEffect} from "react";
import ItemCardSkeleton from "../../components/organism/ItemCardSkeleton";
import Avatar from "../../components/atoms/Avatar";
import Tag from "../../components/atoms/Tag";
import Miniature from "../../components/atoms/Miniature";
import Box from "../../components/atoms/Box";
import Menu from "../../components/atoms/Menu";
import {MenuItem} from "../../components/atoms/MenuItem";
import Sidebar from "../../components/atoms/Sidebar";
import Divider from "../../components/atoms/Divider";
import {hideLateralMenu, showLateralMenu} from "../../utilities/lateralMenuAction";
import Dropdown from "../../components/atoms/Dropdown";
import FlexColumn from "../../components/atoms/FlexColumn";

const SIDE_BAR_NAME = "main-menu";
const ICONS_REF = "icons";
const BUTTONS_REF = "buttons";
const HEADERS_REF = "headers";
const EMPTY_STATES_REF = "empty_states";
const INPUTS_REF = "inputs";
const CARDS_REF = "cards";
const MINIATURES_REF = "miniatures";
const AVATARS_REF = "avatars";
const TAGS_REF = "tags";
const BOX_REF = "box";
const DROPDOWN_REF = "dropdown";

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

  const refs = [ICONS_REF, BUTTONS_REF, HEADERS_REF, INPUTS_REF, MINIATURES_REF, AVATARS_REF,
    TAGS_REF, CARDS_REF, EMPTY_STATES_REF, BOX_REF, DROPDOWN_REF];

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
        <SubscriptionIcon/>
        <ArrowUturnLeft/>
        <ExclamationCircle/>
        <GoogleIcon/>
        <ArchiveBoxIcon/>
        <ArchiveBoxFilledIcon/>
        <CuratorIcon/>
        <ProfileIcon/>
        <InfoCircleIcon/>
        <CircleIcon/>
        <BoltIcon/>
        <LinkedinIcon/>
        <TwitterIcon/>
        <ShareIcon/>
        <StarIcon/>
        <StarFilledIcon/>
        <ChatBubbleIcon/>
        <ChevronDownIcon/>
        <ChevronUpIcon/>
        <HomeIcon/>
        <SettingsIcon/>
        <ImportIcon/>
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
        <div className="flex flex-row flex-wrap gap-3 items-center">
          <Button>Primary</Button>
          <Button primary={false}>Outline</Button>
          <Button primary={false} borderless={true}>Ghost</Button>
          <Button danger={true}>Danger</Button>
          <Button disabled={true}>Disabled</Button>
          <Button primary={false} tooltip={"Menu"}><MenuIcon/></Button>
          <Button><DownloadIcon/>Download</Button>
        </div>
        <div className="flex flex-row flex-wrap gap-3 items-center">
          <FollowToggleButton followed={false} isLoggedIn={true} onFollow={() => undefined} onUnfollow={() => undefined}/>
          <FollowToggleButton followed={true} isLoggedIn={true} onFollow={() => undefined} onUnfollow={() => undefined}/>
        </div>
      </div>
    </Section>
  );
}

const InputsSection = () => {
  return (
    <Section>
      <Head1 id={INPUTS_REF}># Inputs</Head1>
      <div className="flex flex-col gap-4 m-auto p-4 w-full
      border-base-100 border-solid border-2 rounded justify-items-center items-center">
        <div className="grid grid-cols-1 gap-4 w-1/2">
          <InputText/>
          <SearchBar placeholder="Buscar..."/>
        </div>
      </div>
    </Section>
  );
}

const CardSection = () => {
  const item = {
    uuid: "f857e617-c1e7-4c0d-9982-cb8a2b51de1c",
    name: "Name",
    url: "https://www.youtube.com/watch?v=FdjkBWJz5eU",
    thumbnail: "/logo_v1_medium.png",
    published_at: new Date(),
    subscription_uuid: "87484eb4-65cf-4821-b818-2d7e8bbf7488",
    subscription: {
      uuid: "87484eb4-65cf-4821-b818-2d7e8bbf7488",
      name: "Subscription",
      url: "https://www.youtube.com/@Linkurator",
      thumbnail: "/logo_v1_medium.png",
      provider: 'youtube',
      isBeingScanned: false,
      followed: true,
      topicUuid: "98fbbe67-af08-4954-8249-15ea99e95611"
    },
    recommended: false,
    discouraged: false,
    viewed: false,
    hidden: false,
    duration: 0,
    recommended_by: [
      {
        curator: {id: "1", username: "user1", avatar_url: "/logo_v1_medium.png", followed: false},
        created_at: new Date("2026-01-01T00:00:00Z")
      },
      {
        curator: {id: "2", username: "user2", avatar_url: "/logo_v1_medium.png", followed: true},
        created_at: new Date("2026-01-01T06:00:00Z")
      },
      {
        curator: {id: "3", username: "user3", avatar_url: "/logo_v1_medium.png", followed: false},
        created_at: new Date("2026-01-01T12:00:00Z")
      },
      {
        curator: {id: "4", username: "user4", avatar_url: "/logo_v1_medium.png", followed: true},
        created_at: new Date("2026-01-02T00:00:00Z")
      }
    ]
  }

  return (
    <Section>
      <Head1 id={CARDS_REF}># Cards</Head1>
      <div className="flex flex-col md:flex-row gap-12 m-auto p-4 w-full
      border-base-100 border-solid border-2 rounded justify-center items-center">
        <div className="w-72"><ItemCardSkeleton/></div>
        <div className="w-72">
          <ContentItemCard item={item} providers={[]} onChange={undefined} onChangeSwapButton={async () => {
          }}/>
        </div>
        <div className="w-72"><ContentItemCard item={item} providers={[]} withInteractions={false}/></div>
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

const DropdownSection = () => {
  const DropdownButton = ({text}: { text: string }) => {
    return (
      <>
        <MenuIcon/>
        <span>{text}</span>
      </>
    )
  }

  return (
    <Section>
      <Head1># Dropdown</Head1>
      <FlexColumn position={"center"}>
        <Dropdown label={"Bottom start"} button={<DropdownButton text={"Bottom start"}/>}>
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
        <Dropdown label={"Bottom end"} button={<DropdownButton text={"Bottom end"}/>} position="end">
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
        <Dropdown label={"Top start"} button={<DropdownButton text={"Top start"}/>} bottom={false}>
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
        <Dropdown label={"Top end"} button={<DropdownButton text={"Top end"}/>} bottom={false} position="end">
          <Button fitContent={false}>Item 1</Button>
          <Button fitContent={false}>Item 2</Button>
        </Dropdown>
      </FlexColumn>
    </Section>
  );
}

const HeadersSection = () => {
  return (
    <Section>
      <Head1 id={HEADERS_REF}># Page headers</Head1>
      <div className="flex flex-col gap-6 w-full border-base-100 border-solid border-2 rounded overflow-hidden">
        <PageHeader title={"Home"} icon={<HomeIcon/>}/>
        <PageHeader
          title={"Tech talks"}
          media={<TopicIcon name={"Tech talks"} size={"md"}/>}
          subtitle={"Your topic · 12 subscriptions"}
          actions={<>
            <Button primary={false}><StarIcon/></Button>
            <Button primary={false}>Ask AI</Button>
          </>}
        />
      </div>
    </Section>
  );
}

const EmptyStatesSection = () => {
  return (
    <Section>
      <Head1 id={EMPTY_STATES_REF}># Empty states</Head1>
      <div className="flex flex-col gap-6 p-6 w-full border-base-100 border-solid border-2 rounded">
        <EmptyStateBox icon={<StarIcon/>} title={"No favourite topics yet"}
                       message={"Mark topics as favourites to see their latest content here."}>
          <Button>Browse topics</Button>
        </EmptyStateBox>
        <EndOfList text={"You're all caught up"}/>
      </div>
    </Section>
  );
}

const MainContent = () => {
  return (
    <main className="bg-base-300 text-base-content w-full h-full z-0 p-2 overflow-auto">
      <IconsSection/>
      <ButtonsSection/>
      <HeadersSection/>
      <InputsSection/>
      <AvatarsSection/>
      <MiniaturesSection/>
      <TagSection/>
      <CardSection/>
      <EmptyStatesSection/>
      <BoxSection/>
      <DropdownSection/>
    </main>
  );
}

const DesignSystemPage = () => {
  return (
    <div className="h-dvh w-dvw">
      <Drawer id={SIDE_BAR_NAME}>
        <LateralMenu closeMenu={() => hideLateralMenu(SIDE_BAR_NAME)}/>
        <PageHeader
          title={"Design System"}
          actions={<>
            <Button clickAction={() => showLateralMenu(SIDE_BAR_NAME)} showOnlyOnMobile={true} ariaLabel={"Menu"}>
              <MenuIcon/>
            </Button>
            <ThemeToggleButton/>
          </>}
        />
        <MainContent/>
      </Drawer>
    </div>
  );
}

export default DesignSystemPage;
