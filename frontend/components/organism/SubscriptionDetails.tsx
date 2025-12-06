import React from "react";
import {Subscription} from "../../entities/Subscription";
import Sidebar from "../atoms/Sidebar";
import FlexRow from "../atoms/FlexRow";
import Divider from "../atoms/Divider";
import {
  ArchiveBoxFilledIcon,
  ArrowUturnLeft,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon
} from "../atoms/Icons";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import Avatar from "../atoms/Avatar";
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {durationOptions, Filters} from "../../entities/Filters";
import Checkbox from "../atoms/Checkbox";
import NumberInput from "../atoms/NumberInput";
import Select from "../atoms/Select";
import FlexItem from "../atoms/FlexItem";
import { useTranslations } from "next-intl";

export const SUBSCRIPTION_DETAILS_ID = "subscription-details";

type SubscriptionDetailsProps = {
  subscription: Subscription | null;
  filters: Filters,
  showInteractions: boolean,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
};

const SubscriptionDetails = (
  {
    subscription,
    filters,
    showInteractions,
    setFilters,
    resetFilters,
  }: SubscriptionDetailsProps
) => {
  const t = useTranslations("common");
  const subscriptionName = subscription ? subscription.name : "";
  const subscriptionThumbnail = subscription ? subscription.thumbnail : "";

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

  return (
    <Sidebar left={false}>
      <FlexRow position={"center"}>
        <Avatar src={subscriptionThumbnail} alt={subscriptionName}/>
        <span>{subscriptionName}</span>
      </FlexRow>
      <Divider/>
      <FlexRow position={"between"}>
        <FlexItem grow={true}>
          <Button fitContent={false} clickAction={resetFilters}>
            <ArrowUturnLeft/>
            {t("reset_filters")}
          </Button>
        </FlexItem>
      </FlexRow>
      <Box title={t("filters")}>
        <FlexColumn>
          <SearchBar handleChange={(value) => setFilters({...filters, textSearch: value})}
                     value={filters.textSearch}
                     placeholder={t("search_placeholder")}/>
          <Box title={t("duration")}>
            <FlexColumn>
              <Select selected={filters.durationGroup} options={translatedDurationOptions} onChange={handleDurationChange}/>
              {showCustomDuration &&
                  <FlexColumn>
                      <FlexRow>
                          <p>{t("min")}</p>
                          <NumberInput placeholder={t("min_placeholder")}
                                       value={filters.minDuration}
                                       onChange={(value) => setFilters({...filters, minDuration: value})}/>

                      </FlexRow>
                      <FlexRow>
                          <p>{t("max")}</p>
                          <NumberInput placeholder={t("max_placeholder")}
                                       value={filters.maxDuration}
                                       onChange={(value) => setFilters({...filters, maxDuration: value})}/>
                      </FlexRow>
                  </FlexColumn>
              }
            </FlexColumn>
          </Box>
          {showInteractions &&
              <Box title={t("interactions")}>
                  <FlexColumn>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayWithoutInteraction}
                                    onChange={(checked) => setFilters({
                                      ...filters,
                                      displayWithoutInteraction: checked
                                    })}/>
                          <CheckCircleIcon/>
                          <label>{t("not_viewed")}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayViewed}
                                    onChange={(checked) => setFilters({...filters, displayViewed: checked})}/>
                          <CheckCircleFilledIcon/>
                          <label>{t("viewed")}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayRecommended}
                                    onChange={(checked) => setFilters({
                                      ...filters,
                                      displayRecommended: checked
                                    })}/>
                          <ThumbsUpFilledIcon/>
                          <label>{t("recommended")}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayDiscouraged}
                                    onChange={(checked) => setFilters({
                                      ...filters,
                                      displayDiscouraged: checked
                                    })}/>
                          <ThumbsDownFilledIcon/>
                          <label>{t("not_recommended")}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayHidden}
                                    onChange={(checked) => setFilters({...filters, displayHidden: checked})}/>
                          <ArchiveBoxFilledIcon/>
                          <label>{t("archived")}</label>
                      </FlexRow>
                  </FlexColumn>
              </Box>
          }
        </FlexColumn>
      </Box>
    </Sidebar>
  );
};

export default SubscriptionDetails;
