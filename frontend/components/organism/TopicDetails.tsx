import React, {useEffect, useState} from "react";
import {Subscription} from "../../entities/Subscription";
import {Topic} from "../../entities/Topic";
import Sidebar from "../atoms/Sidebar";
import FlexRow from "../atoms/FlexRow";
import {paths} from "../../configuration";
import Divider from "../atoms/Divider";
import {
  CheckCircleIcon,
  CheckIcon,
  EyeSlashIcon,
  PencilIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  TrashIcon
} from "../atoms/Icons";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {Filters} from "../../entities/Filters";
import Checkbox from "../atoms/Checkbox";
import NumberInput from "../atoms/NumberInput";
import {openModal} from "../../utilities/modalAction";
import Miniature from "../atoms/Miniature";
import ALink from "../atoms/ALink";
import Tag from "../atoms/Tag";
import Grid from "../atoms/Grid";
import {deleteTopic} from "../../services/topicService";
import {EditTopicModalId} from "./EditTopicModal";

export const TOPIC_DETAILS_ID = "topic-details";

type TopicDetailsProps = {
  subscriptions: Subscription[];
  topic?: Topic,
  filters: Filters,
  setFilters: (filters: Filters) => void;
  refreshTopics: () => void;
  closeSidebar: () => void;
};

const TopicDetails = (props: TopicDetailsProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);

  const topicId = props.topic ? props.topic.uuid : "";
  const topicName = props.topic ? props.topic.name : "";
  const relatedSubs = props.subscriptions
    .filter(sub => props.topic?.subscriptions_ids.includes(sub.uuid))
    .sort((a, b) => a.name.length > b.name.length ? 1 : -1)

  const subsTags = relatedSubs.map(subscription => (
    <ALink key={subscription.uuid} href={paths.SUBSCRIPTIONS + "/" + subscription.uuid}>
      <Tag>
        <Miniature src={subscription.thumbnail} alt={subscription.name}/>
        {subscription.name}
      </Tag>
    </ALink>
  ));

  const deleteTopicAction = () => {
    deleteTopic(topicId)
      .then(() => {
        props.refreshTopics()
        props.closeSidebar()
      })
  }

  useEffect(() => {
    setTempFilters(props.filters)
  }, [props.filters]);

  return (
    <Sidebar>
      <FlexRow position={"center"}>
        <div className="w-full whitespace-nowrap truncate text-center">{topicName}</div>
        <Button clickAction={() => openModal(EditTopicModalId)}>
          <PencilIcon/>
        </Button>
      </FlexRow>
      <Divider/>
      <Box title={"Subscriptions"}>
        <Grid>
          {subsTags}
        </Grid>
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
          <Button clickAction={deleteTopicAction}>
            <TrashIcon/>
            Delete
          </Button>
        </FlexRow>
      </Box>
    </Sidebar>
  );
};

export default TopicDetails;
