import React, {useState} from "react";
import {useTranslations} from "next-intl";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {getProviderIcon, Provider} from "../../entities/Provider";
import {durationOptions, Filters} from "../../entities/Filters";
import {
  ArchiveBoxFilledIcon,
  ArrowUturnLeft,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon
} from "../atoms/Icons";
import Button from "../atoms/Button";
import Checkbox from "../atoms/Checkbox";
import Dropdown from "../atoms/Dropdown";
import NumberInput from "../atoms/NumberInput";
import Miniature from "../atoms/Miniature";
import Tag from "../atoms/Tag";
import Select from "../atoms/Select";
import SearchBar from "../molecules/SearchBar";

type ContentFilterBarProps = {
  filters: Filters,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  showInteractions?: boolean;
  subscriptions?: Subscription[];
  providers?: Provider[];
};

const ContentFilterBar = (
  {
    filters,
    setFilters,
    resetFilters,
    showInteractions = false,
    subscriptions,
    providers = [],
  }: ContentFilterBarProps
) => {
  const t = useTranslations("common");
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const showCustomDuration = filters.durationGroup == "custom";

  const translatedDurationOptions = durationOptions.map(option => {
    return {
      key: option.key,
      label: t(option.label)
    }
  });

  const handleDurationChange = (key: string) => {
    switch (key) {
      case "short":
        setFilters({...filters, durationGroup: "short", minDuration: undefined, maxDuration: undefined});
        break;
      case "medium":
        setFilters({...filters, durationGroup: "medium", minDuration: undefined, maxDuration: undefined});
        break;
      case "long":
        setFilters({...filters, durationGroup: "long", minDuration: undefined, maxDuration: undefined});
        break;
      case "all":
        setFilters({...filters, durationGroup: "all", minDuration: undefined, maxDuration: undefined});
        break;
      case "custom":
        setFilters({...filters, minDuration: undefined, maxDuration: undefined, durationGroup: "custom"});
        break;
    }
  }

  const interactionOptions = [
    {
      key: "not_viewed",
      icon: <CheckCircleIcon/>,
      checked: filters.displayWithoutInteraction,
      onChange: (checked: boolean) => setFilters({...filters, displayWithoutInteraction: checked}),
    },
    {
      key: "viewed",
      icon: <CheckCircleFilledIcon/>,
      checked: filters.displayViewed,
      onChange: (checked: boolean) => setFilters({...filters, displayViewed: checked}),
    },
    {
      key: "recommended",
      icon: <ThumbsUpFilledIcon/>,
      checked: filters.displayRecommended,
      onChange: (checked: boolean) => setFilters({...filters, displayRecommended: checked}),
    },
    {
      key: "not_recommended",
      icon: <ThumbsDownFilledIcon/>,
      checked: filters.displayDiscouraged,
      onChange: (checked: boolean) => setFilters({...filters, displayDiscouraged: checked}),
    },
    {
      key: "archived",
      icon: <ArchiveBoxFilledIcon/>,
      checked: filters.displayHidden,
      onChange: (checked: boolean) => setFilters({...filters, displayHidden: checked}),
    },
  ];
  const selectedInteractionsCount = interactionOptions.filter(option => option.checked).length;

  const sortedSubscriptions = subscriptions ? subscriptions.slice().sort(subscriptionSorting) : [];
  const includedSubscriptionsCount = sortedSubscriptions
    .filter(subscription => !filters.excludedSubscriptions.includes(subscription.uuid))
    .length;

  const toggleSubscription = (subscriptionId: string) => {
    const isExcluded = filters.excludedSubscriptions.includes(subscriptionId);
    setFilters({
      ...filters,
      excludedSubscriptions: isExcluded ?
        filters.excludedSubscriptions.filter(uuid => uuid !== subscriptionId) :
        filters.excludedSubscriptions.concat(subscriptionId)
    });
  }

  const subsTags = sortedSubscriptions.map(subscription => {
    const isExcluded = filters.excludedSubscriptions.includes(subscription.uuid);
    return (
      <div key={subscription.uuid} className={isExcluded ? "opacity-40" : ""}>
        <Tag onClick={() => toggleSubscription(subscription.uuid)}>
          <div className="flex flex-row items-center gap-1 whitespace-nowrap">
            <input type="checkbox" readOnly tabIndex={-1} checked={!isExcluded}
                   className="checkbox checkbox-primary checkbox-xs pointer-events-none"/>
            <Miniature src={subscription.thumbnail} alt={subscription.name}
                       badgeImage={getProviderIcon(providers, subscription.provider)}/>
            {subscription.name}
          </div>
        </Tag>
      </div>
    );
  });

  return (
    <div className="flex flex-col shrink-0">
      <div className="flex flex-row flex-wrap gap-2 items-center px-4 py-3 bg-base-300">
        <div className="flex-1 min-w-48">
          <SearchBar handleChange={(value) => setFilters({...filters, textSearch: value})}
                     value={filters.textSearch}
                     placeholder={t("search_placeholder")}/>
        </div>
        <div className="w-56">
          <Select selected={filters.durationGroup} options={translatedDurationOptions}
                  onChange={handleDurationChange}/>
        </div>
        {showCustomDuration &&
            <div className="flex flex-row gap-2 items-center">
                <span className="text-sm">{t("min")}</span>
                <div className="w-20">
                    <NumberInput value={filters.minDuration}
                                 onChange={(value) => setFilters({...filters, minDuration: value})}/>
                </div>
                <span className="text-sm">{t("max")}</span>
                <div className="w-20">
                    <NumberInput value={filters.maxDuration}
                                 onChange={(value) => setFilters({...filters, maxDuration: value})}/>
                </div>
            </div>
        }
        {showInteractions &&
            <Dropdown
                button={
                  <Button primary={false} fitContent={true} stopPropagation={false}>
                    <span>{t("interactions")}: {selectedInteractionsCount}</span>
                    <ChevronDownIcon/>
                  </Button>
                }
                small={true}
                position="start"
                bottom={true}
            >
              {interactionOptions.map(option => (
                <li key={option.key} className="flex flex-row gap-2 items-center p-2">
                  <Checkbox checked={option.checked} onChange={option.onChange}/>
                  {option.icon}
                  <label>{t(option.key)}</label>
                </li>
              ))}
            </Dropdown>
        }
        {sortedSubscriptions.length > 0 &&
            <Button primary={false} fitContent={true} clickAction={() => setShowSubscriptions(!showSubscriptions)}>
                <span>{t("subscriptions")}: {includedSubscriptionsCount}/{sortedSubscriptions.length}</span>
              {showSubscriptions ? <ChevronUpIcon/> : <ChevronDownIcon/>}
            </Button>
        }
        <Button primary={false} fitContent={true} clickAction={resetFilters} tooltip={t("reset_filters")}>
          <ArrowUturnLeft/>
        </Button>
      </div>
      {showSubscriptions && sortedSubscriptions.length > 0 &&
          <div className="flex flex-row flex-wrap gap-2 p-2 max-h-48 overflow-y-auto bg-base-300">
            {subsTags}
          </div>
      }
    </div>
  );
};

export default ContentFilterBar;
