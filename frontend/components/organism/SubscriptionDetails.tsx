import React, {useEffect, useState} from "react";
import {Subscription} from "../../entities/Subscription";
import {Topic} from "../../entities/Topic";
import Sidebar from "../atoms/Sidebar";
import FlexRow from "../atoms/FlexRow";
import Tag from "../atoms/Tag";
import Link from "next/link";
import {paths} from "../../configuration";
import Divider from "../atoms/Divider";
import {
  CheckCircleIcon,
  CheckIcon,
  EyeSlashIcon,
  PencilIcon,
  RefreshIcon,
  ThumbsDownIcon,
  ThumbsUpIcon
} from "../atoms/Icons";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import Avatar from "../atoms/Avatar";
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {Filters} from "../../entities/Filters";
import Checkbox from "../atoms/Checkbox";
import NumberInput from "../atoms/NumberInput";
import {openModal} from "../../utilities/modalAction";
import {AssignTopicModalId} from "./AssignTopicModal";

export const SUBSCRIPTION_DETAILS_ID = "subscription-details";

type SubscriptionDetailsProps = {
  subscription?: Subscription;
  topics: Topic[],
  filters: Filters,
  setFilters: (filters: Filters) => void;
  refreshSubscription: () => void;
};

const SubscriptionDetails = (props: SubscriptionDetailsProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);

  const subscriptionId = props.subscription ? props.subscription.uuid : "";
  const subscriptionName = props.subscription ? props.subscription.name : "";
  const subscriptionThumbnail = props.subscription ? props.subscription.thumbnail : "";
  const relatedTopics = props.topics.filter(topic => topic.subscriptions_ids.includes(subscriptionId))

  const topicTags = relatedTopics.map(topic => (
    <Tag key={topic.uuid}>
      <Link href={paths.TOPICS + "/" + topic.uuid} scroll={false}>
        {topic.name}
      </Link>
    </Tag>
  ));

  useEffect(() => {
    setTempFilters(props.filters)
  }, [props.filters]);

  return (
    <Sidebar>
      <FlexRow position={"center"}>
        <Avatar src={subscriptionThumbnail} alt={subscriptionName}/>
        <span>{subscriptionName}</span>
        <Button clickAction={() => openModal(AssignTopicModalId)}>
          <PencilIcon/>
        </Button>
      </FlexRow>
      <Divider/>
      <Box title={"Topics"}>
        <FlexRow position={"start"}>
          {topicTags}
        </FlexRow>
      </Box>
      <Box title={"Filters"}>
        <FlexColumn>
          <SearchBar handleChange={(value) => setTempFilters({...tempFilters, textSearch: value})}
                     value={tempFilters.textSearch}/>
          <Box title={"Duration (seconds)"}>
            <FlexColumn>
              <NumberInput placeholder={"Min"}
                           value={tempFilters.minDuration}
                           onChange={(value) => setTempFilters({...tempFilters, minDuration: value})}/>
              <NumberInput placeholder={"Max"}
                           value={tempFilters.maxDuration}
                           onChange={(value) => setTempFilters({...tempFilters, maxDuration: value})}/>
            </FlexColumn>
          </Box>
          <Box title={"Interactions"}>
            <FlexColumn>
              <FlexRow position={"start"}>
                <Checkbox checked={tempFilters.displayRecommended}
                          onChange={(checked) => setTempFilters({...tempFilters, displayRecommended: checked})}/>
                <ThumbsUpIcon/>
                <label>Recommended</label>
              </FlexRow>
              <FlexRow position={"start"}>
                <Checkbox checked={tempFilters.displayDiscouraged}
                          onChange={(checked) => setTempFilters({...tempFilters, displayDiscouraged: checked})}/>
                <ThumbsDownIcon/>
                <label>Discouraged</label>
              </FlexRow>
              <FlexRow position={"start"}>
                <Checkbox checked={tempFilters.displayHidden}
                          onChange={(checked) => setTempFilters({...tempFilters, displayHidden: checked})}/>
                <EyeSlashIcon/>
                <label>Hidden</label>
              </FlexRow>
              <FlexRow position={"start"}>
                <Checkbox checked={tempFilters.displayViewed}
                          onChange={(checked) => setTempFilters({...tempFilters, displayViewed: checked})}/>
                <CheckCircleIcon/>
                <label>Viewed</label>
              </FlexRow>
              <FlexRow position={"start"}>
                <Checkbox checked={tempFilters.displayWithoutInteraction}
                          onChange={(checked) => setTempFilters({...tempFilters, displayWithoutInteraction: checked})}/>
                <label>No interactions</label>
              </FlexRow>
            </FlexColumn>
          </Box>
          <FlexRow position={"end"}>
            <Button clickAction={() => props.setFilters(tempFilters)}>
              <CheckIcon/>
              Apply
            </Button>
          </FlexRow>
        </FlexColumn>
      </Box>
      <Box title={"Actions"}>
        <FlexRow position={"end"}>
          <Button clickAction={props.refreshSubscription}>
            <RefreshIcon/>
            Refresh
          </Button>
        </FlexRow>
      </Box>
    </Sidebar>
  );
};

export default SubscriptionDetails;
