import React, {useId} from "react";
import {useTranslations} from "next-intl";
import classNames from "classnames";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {getProviderIcon, Provider} from "../../entities/Provider";
import {areFiltersEqual, durationOptions, Filters} from "../../entities/Filters";
import {
  ArchiveBoxFilledIcon,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon
} from "../atoms/Icons";
import Checkbox from "../atoms/Checkbox";
import Dropdown from "../atoms/Dropdown";
import NumberInput from "../atoms/NumberInput";
import Miniature from "../atoms/Miniature";
import SearchBar from "../molecules/SearchBar";

type ContentFilterBarProps = {
  filters: Filters,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  savedFilters: Filters;
  showInteractions?: boolean;
  subscriptions?: Subscription[];
  providers?: Provider[];
};

type FilterChipProps = {
  active: boolean;
  children: React.ReactNode;
};

const FilterChip = ({active, children}: FilterChipProps) => (
  <span className={classNames(
    "flex flex-row items-center gap-1 whitespace-nowrap",
    {"text-primary": active}
  )}>
    {children}
    <ChevronDownIcon/>
  </span>
);

const ContentFilterBar = (
  {
    filters,
    setFilters,
    resetFilters,
    savedFilters,
    showInteractions = false,
    subscriptions,
    providers = [],
  }: ContentFilterBarProps
) => {
  const t = useTranslations("common");
  const idPrefix = useId();
  const isModified = !areFiltersEqual(filters, savedFilters);

  const handleDurationChange = (key: Filters["durationGroup"]) => {
    setFilters({...filters, durationGroup: key, minDuration: undefined, maxDuration: undefined});
  }

  const selectedDuration = durationOptions.find(option => option.key === filters.durationGroup);
  const durationIsActive = filters.durationGroup !== savedFilters.durationGroup ||
    filters.minDuration !== savedFilters.minDuration || filters.maxDuration !== savedFilters.maxDuration;
  const durationLabel = filters.durationGroup !== "all" && selectedDuration && filters.durationGroup !== "custom"
    ? t(selectedDuration.label)
    : t("duration");

  const interactionOptions = [
    {
      key: "not_viewed",
      icon: <CheckCircleIcon/>,
      checked: filters.displayWithoutInteraction,
      saved: savedFilters.displayWithoutInteraction,
      onChange: (checked: boolean) => setFilters({...filters, displayWithoutInteraction: checked}),
    },
    {
      key: "viewed",
      icon: <CheckCircleFilledIcon/>,
      checked: filters.displayViewed,
      saved: savedFilters.displayViewed,
      onChange: (checked: boolean) => setFilters({...filters, displayViewed: checked}),
    },
    {
      key: "recommended",
      icon: <ThumbsUpFilledIcon/>,
      checked: filters.displayRecommended,
      saved: savedFilters.displayRecommended,
      onChange: (checked: boolean) => setFilters({...filters, displayRecommended: checked}),
    },
    {
      key: "not_recommended",
      icon: <ThumbsDownFilledIcon/>,
      checked: filters.displayDiscouraged,
      saved: savedFilters.displayDiscouraged,
      onChange: (checked: boolean) => setFilters({...filters, displayDiscouraged: checked}),
    },
    {
      key: "archived",
      icon: <ArchiveBoxFilledIcon/>,
      checked: filters.displayHidden,
      saved: savedFilters.displayHidden,
      onChange: (checked: boolean) => setFilters({...filters, displayHidden: checked}),
    },
  ];
  const selectedInteractions = interactionOptions.filter(option => option.checked);
  const interactionsAreActive = interactionOptions.some(option => option.checked !== option.saved);
  // Checking nothing shows everything, so only a partial selection narrows the feed
  const interactionsNarrowFeed = selectedInteractions.length > 0 && selectedInteractions.length < interactionOptions.length;
  const interactionsLabel = selectedInteractions.length === 1
    ? t(selectedInteractions[0].key)
    : interactionsNarrowFeed ? `${t("show_items")} · ${selectedInteractions.length}` : t("show_items");

  const sortedSubscriptions = subscriptions ? subscriptions.slice().sort(subscriptionSorting) : [];
  const includedSubscriptionsCount = sortedSubscriptions
    .filter(subscription => !filters.excludedSubscriptions.includes(subscription.uuid))
    .length;
  const sourcesAreActive = sortedSubscriptions.some(subscription =>
    filters.excludedSubscriptions.includes(subscription.uuid) !== savedFilters.excludedSubscriptions.includes(subscription.uuid)
  );

  const toggleSubscription = (subscriptionId: string) => {
    const isExcluded = filters.excludedSubscriptions.includes(subscriptionId);
    setFilters({
      ...filters,
      excludedSubscriptions: isExcluded ?
        filters.excludedSubscriptions.filter(uuid => uuid !== subscriptionId) :
        filters.excludedSubscriptions.concat(subscriptionId)
    });
  }

  const optionRowClass = "flex flex-row gap-2 items-center min-w-0 px-2 py-1.5 rounded-md cursor-pointer hover:bg-base-content/5 text-sm";

  return (
    <div className="shrink-0 flex flex-col sm:flex-row gap-2 sm:items-center px-4 py-3 border-b border-neutral bg-base-300">
      <div className="sm:flex-1 sm:min-w-48 sm:max-w-md">
        <SearchBar handleChange={(value) => setFilters({...filters, textSearch: value})}
                   value={filters.textSearch}
                   placeholder={t("search_placeholder")}/>
      </div>
      <div className="flex flex-row flex-wrap gap-2 items-center">
        <Dropdown label={t("duration")} width={"narrow"} position="start" bottom={true}
                  button={<FilterChip active={durationIsActive}>{durationLabel}</FilterChip>}>
          <li role="radiogroup" aria-label={t("duration")} className="flex flex-col p-1">
            {durationOptions.map(option => (
              <label key={option.key} className={optionRowClass}>
                <input type="radio" name={idPrefix + "-duration"} className="radio radio-primary radio-xs"
                       checked={filters.durationGroup === option.key}
                       onChange={() => handleDurationChange(option.key)}/>
                {t(option.label)}
              </label>
            ))}
            {filters.durationGroup === "custom" &&
                <div className="grid grid-cols-2 gap-2 px-2 pt-2">
                    <label className="flex flex-col gap-1 text-xs" htmlFor={idPrefix + "-min"}>
                      {t("min_minutes")}
                        <NumberInput id={idPrefix + "-min"} value={filters.minDuration}
                                     onChange={(value) => setFilters({...filters, minDuration: value})}/>
                    </label>
                    <label className="flex flex-col gap-1 text-xs" htmlFor={idPrefix + "-max"}>
                      {t("max_minutes")}
                        <NumberInput id={idPrefix + "-max"} value={filters.maxDuration}
                                     onChange={(value) => setFilters({...filters, maxDuration: value})}/>
                    </label>
                </div>
            }
          </li>
        </Dropdown>
        {showInteractions &&
            <Dropdown label={t("show_items")} width={"narrow"} position="start" bottom={true}
                      button={<FilterChip active={interactionsAreActive}>{interactionsLabel}</FilterChip>}>
              {interactionOptions.map(option => (
                <li key={option.key}>
                  <label className={optionRowClass}>
                    <Checkbox small={true} checked={option.checked} onChange={option.onChange}/>
                    {option.icon}
                    {t(option.key)}
                  </label>
                </li>
              ))}
            </Dropdown>
        }
        {sortedSubscriptions.length > 0 &&
            <Dropdown label={t("sources")} position="start" bottom={true}
                      button={<FilterChip active={sourcesAreActive}>
                        {t("sources")} {includedSubscriptionsCount}/{sortedSubscriptions.length}
                      </FilterChip>}>
                <li className="flex flex-row gap-2 px-2 py-1.5 text-xs">
                    <button type="button" className="link link-hover text-primary"
                            onClick={() => setFilters({...filters, excludedSubscriptions: []})}>
                      {t("select_all")}
                    </button>
                    <span aria-hidden="true">·</span>
                    <button type="button" className="link link-hover text-primary"
                            onClick={() => setFilters({
                              ...filters,
                              excludedSubscriptions: sortedSubscriptions.map(subscription => subscription.uuid)
                            })}>
                      {t("select_none")}
                    </button>
                </li>
              {sortedSubscriptions.map(subscription => (
                <li key={subscription.uuid}>
                  <label className={optionRowClass}>
                    <Checkbox small={true}
                              checked={!filters.excludedSubscriptions.includes(subscription.uuid)}
                              onChange={() => toggleSubscription(subscription.uuid)}/>
                    <Miniature src={subscription.thumbnail} alt=""
                               badgeImage={getProviderIcon(providers, subscription.provider)}/>
                    <span className="flex-1 min-w-0 break-words">{subscription.name}</span>
                  </label>
                </li>
              ))}
            </Dropdown>
        }
        {isModified &&
            <button type="button" onClick={resetFilters}
                    className="btn btn-sm btn-ghost text-primary px-2 whitespace-nowrap">
              {t("clear_filters")}
            </button>
        }
      </div>
    </div>
  );
};

export default ContentFilterBar;
