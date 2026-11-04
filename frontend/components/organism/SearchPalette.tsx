import React, {useEffect, useId, useState} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import classNames from "classnames";
import Modal from "../atoms/Modal";
import Miniature from "../atoms/Miniature";
import TopicIcon from "../atoms/TopicIcon";
import {Spinner} from "../atoms/Spinner";
import {MagnifyingGlassIcon} from "../atoms/Icons";
import {closeModal, openModal} from "../../utilities/modalAction";
import {OPEN_SEARCH_PALETTE_EVENT, SearchFilter} from "../../utilities/searchPaletteAction";
import {paths} from "../../configuration";
import useProfile from "../../hooks/useProfile";
import {useTopics} from "../../hooks/useTopics";
import useSubscriptions from "../../hooks/useSubscriptions";
import {useCurators} from "../../hooks/useCurators";
import useProviders from "../../hooks/useProviders";
import useFindTopics from "../../hooks/useFindTopics";
import useFindSubscriptions from "../../hooks/useFindSubscriptions";
import {useSearchCurators} from "../../hooks/useSearchCurators";
import {useDebounce} from "../../hooks/useDebounce";
import {getProviderIcon, getProviderPrettyName} from "../../entities/Provider";
import {followTopic, unfollowTopic} from "../../services/topicService";
import {followSubscription, unfollowSubscription} from "../../services/subscriptionService";
import {followCurator, unfollowCurator} from "../../services/curatorService";

export const SearchPaletteId = "search-palette";

type ResultRow = {
  key: string;
  href: string;
  title: string;
  subtitle: string;
  media: React.ReactNode;
  follow?: {
    followed: boolean;
    disabled: boolean;
    toggle: () => Promise<void>;
  };
};

const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  return target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT";
};

const SearchPalette = () => {
  const t = useTranslations("common");
  const router = useRouter();
  const listId = useId();

  const {profile, profileIsLoading} = useProfile();
  const {topics, refreshTopics} = useTopics(profile, profileIsLoading);
  const {subscriptions, refreshSubscriptions} = useSubscriptions(profile);
  const {curators, refreshCurators} = useCurators(profile, profileIsLoading);
  const {providers} = useProviders();

  const [filter, setFilter] = useState<SearchFilter>("all");
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(query.trim(), 400);

  const includes = (kind: SearchFilter) => filter === "all" || filter === kind;
  const discoverQuery = (kind: SearchFilter) => includes(kind) ? debouncedQuery : "";

  const foundTopics = useFindTopics(profile, discoverQuery("topics"));
  const foundSubscriptions = useFindSubscriptions(discoverQuery("subscriptions"));
  const foundCurators = useSearchCurators(discoverQuery("curators"));

  useEffect(() => {
    const handleOpenEvent = (event: Event) => {
      setFilter((event as CustomEvent<SearchFilter>).detail);
      openModal(SearchPaletteId);
    };
    const handleShortcut = (event: KeyboardEvent) => {
      const commandK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !isTypingTarget(event.target);
      if (commandK || slash) {
        event.preventDefault();
        openModal(SearchPaletteId);
      }
    };
    window.addEventListener(OPEN_SEARCH_PALETTE_EVENT, handleOpenEvent);
    window.addEventListener("keydown", handleShortcut);
    return () => {
      window.removeEventListener(OPEN_SEARCH_PALETTE_EVENT, handleOpenEvent);
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [filter, debouncedQuery]);

  useEffect(() => {
    document.getElementById(`${listId}-option-${activeIndex}`)?.scrollIntoView({block: "nearest"});
  }, [listId, activeIndex]);

  const matches = (name: string) => name.toLowerCase().includes(query.trim().toLowerCase());

  const libraryRows: ResultRow[] = [
    ...(includes("topics") ? topics.filter(topic => matches(topic.name)) : []).map(topic => ({
      key: "library-topic-" + topic.uuid,
      href: paths.TOPICS + "/" + topic.uuid,
      title: topic.name,
      subtitle: t("by_curator", {username: topic.curator.username}),
      media: <TopicIcon name={topic.name} size={"sm"}/>,
    })),
    ...(includes("subscriptions") ? subscriptions.filter(sub => matches(sub.name)) : []).map(sub => ({
      key: "library-subscription-" + sub.uuid,
      href: paths.SUBSCRIPTIONS + "/" + sub.uuid,
      title: sub.name,
      subtitle: getProviderPrettyName(providers, sub.provider),
      media: <Miniature src={sub.thumbnail} alt="" badgeImage={getProviderIcon(providers, sub.provider)}/>,
    })),
    ...(includes("curators") ? curators.filter(curator => matches(curator.username)) : []).map(curator => ({
      key: "library-curator-" + curator.id,
      href: paths.CURATORS + "/" + curator.username,
      title: curator.username,
      subtitle: t("curator"),
      media: <img src={curator.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover bg-neutral"/>,
    })),
  ];

  const refreshLibrary = () => {
    refreshTopics();
    refreshSubscriptions();
    refreshCurators();
  };

  const libraryHrefs = new Set(libraryRows.map(row => row.href));

  const discoverRows: ResultRow[] = debouncedQuery === "" ? [] : [
    ...foundTopics.topics.map(topic => ({
      key: "discover-topic-" + topic.uuid,
      href: paths.TOPICS + "/" + topic.uuid,
      title: topic.name,
      subtitle: t("by_curator", {username: topic.curator.username}),
      media: <TopicIcon name={topic.name} size={"sm"}/>,
      follow: {
        followed: topic.followed,
        disabled: topic.is_owner,
        toggle: async () => {
          await (topic.followed ? unfollowTopic(topic.uuid) : followTopic(topic.uuid));
          foundTopics.refreshTopics();
          refreshLibrary();
        },
      },
    })),
    ...foundSubscriptions.subscriptions.map(sub => ({
      key: "discover-subscription-" + sub.uuid,
      href: paths.SUBSCRIPTIONS + "/" + sub.uuid,
      title: sub.name,
      subtitle: getProviderPrettyName(providers, sub.provider),
      media: <Miniature src={sub.thumbnail} alt="" badgeImage={getProviderIcon(providers, sub.provider)}/>,
      follow: {
        followed: sub.followed,
        disabled: false,
        toggle: async () => {
          await (sub.followed ? unfollowSubscription(sub.uuid) : followSubscription(sub.uuid));
          foundSubscriptions.refreshSubscriptions();
          refreshLibrary();
        },
      },
    })),
    ...foundCurators.curators.map(curator => ({
      key: "discover-curator-" + curator.id,
      href: paths.CURATORS + "/" + curator.username,
      title: curator.username,
      subtitle: t("curator"),
      media: <img src={curator.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover bg-neutral"/>,
      follow: {
        followed: curator.followed,
        disabled: curator.username === profile?.username,
        toggle: async () => {
          await (curator.followed ? unfollowCurator(curator.id) : followCurator(curator.id));
          foundCurators.refreshCurators();
          refreshLibrary();
        },
      },
    })),
  ].filter(row => !libraryHrefs.has(row.href));

  const allRows = [...libraryRows, ...discoverRows];
  const isSearching = debouncedQuery !== "" && (
    foundTopics.topicsAreLoading || foundSubscriptions.subscriptionsAreLoading || foundCurators.curatorsAreLoading
  );

  const reset = () => {
    setQuery("");
    setActiveIndex(0);
    setFilter("all");
  };

  const openRow = (row: ResultRow) => {
    closeModal(SearchPaletteId);
    router.push(row.href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex(index => Math.min(index + 1, allRows.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && allRows[activeIndex]) {
      event.preventDefault();
      openRow(allRows[activeIndex]);
    }
  };

  const optionId = (index: number) => `${listId}-option-${index}`;

  const filters: { key: SearchFilter, label: string }[] = [
    {key: "all", label: t("all")},
    {key: "topics", label: t("topics")},
    {key: "subscriptions", label: t("subscriptions")},
    {key: "curators", label: t("curators")},
  ];

  const renderRow = (row: ResultRow, index: number) => (
    <li
      key={row.key}
      id={optionId(index)}
      role="option"
      aria-selected={index === activeIndex}
      onMouseEnter={() => setActiveIndex(index)}
      onClick={() => openRow(row)}
      className={classNames(
        "flex flex-row items-center gap-3 px-3 py-2 rounded-lg cursor-pointer",
        {"bg-base-content/10": index === activeIndex}
      )}
    >
      <span className="shrink-0 flex items-center justify-center w-8 h-8">{row.media}</span>
      <span className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium break-words">{row.title}</span>
        <span className="text-xs text-base-content/60 truncate">{row.subtitle}</span>
      </span>
      {row.follow &&
          <button
              type="button"
              disabled={row.follow.disabled}
              aria-pressed={row.follow.followed}
              onClick={(event) => {
                event.stopPropagation();
                row.follow?.toggle();
              }}
              className={classNames("btn btn-xs rounded-md", {
                "btn-primary": !row.follow.followed,
                "btn-outline border-base-content/30": row.follow.followed,
              })}
          >
            {row.follow.followed ? t("following") : t("follow")}
          </button>
      }
    </li>
  );

  return (
    <Modal id={SearchPaletteId} title={t("search")} size={"lg"} onClose={reset}>
      <div className="flex flex-col gap-3">
        <label className="flex flex-row items-center gap-2 px-3 h-11 rounded-lg border border-neutral focus-within:border-primary">
          <MagnifyingGlassIcon/>
          <input
            type="search"
            role="combobox"
            aria-expanded={allRows.length > 0}
            aria-controls={listId}
            aria-activedescendant={allRows.length > 0 ? optionId(activeIndex) : undefined}
            aria-label={t("search_topics_subscriptions_curators")}
            placeholder={t("search_topics_subscriptions_curators")}
            className="flex-1 bg-transparent outline-none text-base"
            value={query}
            data-autofocus={true}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {isSearching && <span className="loading loading-spinner loading-xs" aria-label={t("searching")}/>}
        </label>
        <div className="flex flex-row flex-wrap gap-2" role="group">
          {filters.map(option => (
            <button
              key={option.key}
              type="button"
              aria-pressed={filter === option.key}
              onClick={() => setFilter(option.key)}
              className={classNames("btn btn-xs rounded-full px-3", {
                "btn-neutral": filter === option.key,
                "btn-ghost border border-base-content/30": filter !== option.key,
              })}
            >
              {option.label}
            </button>
          ))}
        </div>
        <ul id={listId} role="listbox" aria-label={t("search")} className="flex flex-col h-[55dvh] overflow-y-auto">
          {libraryRows.length > 0 &&
              <li role="presentation" className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wider text-base-content/60">
                {t("your_library")}
              </li>
          }
          {libraryRows.map((row, index) => renderRow(row, index))}
          {discoverRows.length > 0 &&
              <li role="presentation" className="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-base-content/60">
                {t("discover")}
              </li>
          }
          {discoverRows.map((row, index) => renderRow(row, libraryRows.length + index))}
          {allRows.length === 0 && !isSearching &&
              <li role="presentation" className="flex flex-col items-center justify-center gap-1 py-10 text-center text-sm text-base-content/60">
                {query === "" ? t("search_nothing_here") : t("no_search_results")}
              </li>
          }
          {allRows.length === 0 && isSearching &&
              <li role="presentation" className="flex justify-center py-10"><Spinner/></li>
          }
        </ul>
        <p className="hidden sm:block text-xs text-base-content/50">{t("search_keyboard_hint")}</p>
      </div>
    </Modal>
  );
};

export default SearchPalette;
