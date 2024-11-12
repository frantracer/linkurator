import React from "react";
import {Subscription, subscriptionSorting} from "../../entities/Subscription";
import {Topic} from "../../entities/Topic";
import Sidebar from "../atoms/Sidebar";
import FlexRow from "../atoms/FlexRow";
import {paths} from "../../configuration";
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
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {durationOptions, Filters} from "../../entities/Filters";
import Checkbox from "../atoms/Checkbox";
import NumberInput from "../atoms/NumberInput";
import Miniature from "../atoms/Miniature";
import ALink from "../atoms/ALink";
import Tag from "../atoms/Tag";
import Select from "../atoms/Select";
import FlexItem from "../atoms/FlexItem";

export const TOPIC_DETAILS_ID = "topic-details";

type TopicDetailsProps = {
  subscriptions: Subscription[];
  topic: Topic | null,
  filters: Filters,
  showInteractions: boolean,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
};

const TopicDetails = (
  {
    subscriptions,
    topic,
    filters,
    showInteractions,
    setFilters,
    resetFilters,
  }: TopicDetailsProps
) => {
  const topicName = topic ? topic.name : "";
  const relatedSubs = subscriptions
    .filter(sub => topic?.subscriptions_ids.includes(sub.uuid))
    .sort((a, b) => a.name.length > b.name.length ? 1 : -1)

  const subsTags = relatedSubs
    .sort(subscriptionSorting)
    .map(subscription => (
    <FlexRow key={subscription.uuid} position={"start"}>
      <Checkbox checked={!filters.excludedSubscriptions.includes(subscription.uuid)}
                onChange={(checked) => setFilters({
                  ...filters,
                  excludedSubscriptions: checked ?
                    filters.excludedSubscriptions.filter(uuid => uuid !== subscription.uuid) :
                    filters.excludedSubscriptions.concat(subscription.uuid)
                })}/>
      <ALink href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}>
        <Tag>
          <Miniature src={subscription.thumbnail} alt={subscription.name}/>
          <span className={"text-wrap"}>{subscription.name}</span>
        </Tag>
      </ALink>
    </FlexRow>
  ));

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
    <Sidebar>
      <FlexRow position={"center"}>
        <div className="w-full whitespace-nowrap truncate text-center">{topicName}</div>
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
      <Box title={"Subscripciones"}>
        <FlexColumn>
          {subsTags}
        </FlexColumn>
      </Box>
    </Sidebar>
  );
};

export default TopicDetails;
