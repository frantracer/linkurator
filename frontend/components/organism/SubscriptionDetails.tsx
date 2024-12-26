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
  const subscriptionName = subscription ? subscription.name : "";
  const subscriptionThumbnail = subscription ? subscription.thumbnail : "";

  const showCustomDuration = filters.durationGroup == "custom";

  const handleDurationChange = (key: string) => {
    switch (key) {
      case "short":
        setFilters({...filters, durationGroup: "short"});
        break;
      case "medium":
        setFilters({...filters, durationGroup: "medium"});
        break;
      case "long":
        setFilters({...filters, durationGroup: "long"});
        break;
      case "all":
        setFilters({...filters, durationGroup: "all"});
        break;
      case "custom":
        setFilters({...filters, minDuration: 0, maxDuration: 999999, durationGroup: "custom"});
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
            {"Restaurar filtros"}
          </Button>
        </FlexItem>
      </FlexRow>
      <Box title={"Filtros"}>
        <FlexColumn>
          <SearchBar handleChange={(value) => setFilters({...filters, textSearch: value})}
                     value={filters.textSearch}/>
          <Box title={"Duración"}>
            <FlexColumn>
              <Select selected={filters.durationGroup} options={durationOptions} onChange={handleDurationChange}/>
              {showCustomDuration &&
                  <FlexColumn>
                      <FlexRow>
                          <p>{"Min"}</p>
                          <NumberInput placeholder={"Mínima"}
                                       value={filters.minDuration}
                                       onChange={(value) => setFilters({...filters, minDuration: value})}/>

                      </FlexRow>
                      <FlexRow>
                          <p>{"Max"}</p>
                          <NumberInput placeholder={"Máxima"}
                                       value={filters.maxDuration}
                                       onChange={(value) => setFilters({...filters, maxDuration: value})}/>
                      </FlexRow>
                  </FlexColumn>
              }
            </FlexColumn>
          </Box>
          {showInteractions &&
              <Box title={"Interacciones"}>
                  <FlexColumn>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayWithoutInteraction}
                                    onChange={(checked) => setFilters({
                                      ...filters,
                                      displayWithoutInteraction: checked
                                    })}/>
                          <CheckCircleIcon/>
                          <label>{"No visto"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayViewed}
                                    onChange={(checked) => setFilters({...filters, displayViewed: checked})}/>
                          <CheckCircleFilledIcon/>
                          <label>{"Visto"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayRecommended}
                                    onChange={(checked) => setFilters({
                                      ...filters,
                                      displayRecommended: checked
                                    })}/>
                          <ThumbsUpFilledIcon/>
                          <label>{"Recomendado"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayDiscouraged}
                                    onChange={(checked) => setFilters({
                                      ...filters,
                                      displayDiscouraged: checked
                                    })}/>
                          <ThumbsDownFilledIcon/>
                          <label>{"No recomendado"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={filters.displayHidden}
                                    onChange={(checked) => setFilters({...filters, displayHidden: checked})}/>
                          <ArchiveBoxFilledIcon/>
                          <label>{"Archivado"}</label>
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
