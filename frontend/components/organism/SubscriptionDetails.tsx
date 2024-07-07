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
  AddIcon,
  ArchiveBoxFilledIcon,
  ArrowUturnLeft,
  CheckCircleFilledIcon,
  CheckCircleIcon,
  CheckIcon,
  CrossIcon,
  RefreshIcon,
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
import {openModal} from "../../utilities/modalAction";
import {AssignTopicModalId} from "./AssignTopicModal";
import Grid from "../atoms/Grid";
import Dropdown from "../atoms/Dropdown";

export const SUBSCRIPTION_DETAILS_ID = "subscription-details";

type SubscriptionDetailsProps = {
  subscription: Subscription | null;
  topics: Topic[],
  filters: Filters,
  editable: boolean,
  showInteractions: boolean,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  refreshSubscription: () => void;
};

const SubscriptionDetails = (props: SubscriptionDetailsProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);
  const [showCustomDuration, setShowCustomDuration] = useState<boolean>(false);

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

  const resetFilters = () => {
    props.resetFilters();
    setTempFilters(props.filters)
  }

  const handleDurationChange = (key: string) => {
    switch (key) {
      case "short":
        setTempFilters({...tempFilters, durationGroup: "short"});
        setShowCustomDuration(false);
        break;
      case "medium":
        setTempFilters({...tempFilters, durationGroup: "medium"});
        setShowCustomDuration(false);
        break;
      case "long":
        setTempFilters({...tempFilters, durationGroup: "long"});
        setShowCustomDuration(false);
        break;
      case "all":
        setTempFilters({...tempFilters, durationGroup: "all"});
        setShowCustomDuration(false);
        break;
      case "custom":
        setTempFilters({...tempFilters, minDuration: 0, maxDuration: 999999, durationGroup: "custom"});
        setShowCustomDuration(true);
        break;
    }
  }

  useEffect(() => {
    setTempFilters(props.filters)
    if (props.filters.durationGroup == "custom") {
      setShowCustomDuration(true);
    } else {
      setShowCustomDuration(false);
    }
  }, [props.filters]);

  return (
    <Sidebar>
      <FlexRow position={"center"}>
        <Avatar src={subscriptionThumbnail} alt={subscriptionName}/>
        <span>{subscriptionName}</span>
      </FlexRow>
      <Divider/>
      {props.editable &&
          <FlexRow position={"between"}>
              <Button clickAction={() => openModal(AssignTopicModalId)}>
                  <AddIcon/>
                {"Asignar"}
              </Button>
              <Button clickAction={props.refreshSubscription}>
                  <RefreshIcon/>
                {"Actualizar"}
              </Button>
          </FlexRow>
      }
      <Box title={"Filtros"}>
        <FlexColumn>
          <FlexRow position={"between"}>
            <Button clickAction={resetFilters}>
              <ArrowUturnLeft/>
              {"Restaurar"}
            </Button>
            <Button clickAction={() => props.setFilters(tempFilters)}>
              <CheckIcon/>
              {"Aplicar"}
            </Button>
          </FlexRow>
          <SearchBar handleChange={(value) => setTempFilters({...tempFilters, textSearch: value})}
                     value={tempFilters.textSearch}/>
          <Box title={"Duración"}>
            <FlexColumn>
              <Dropdown selected={tempFilters.durationGroup} options={durationOptions} onChange={handleDurationChange}/>
              {showCustomDuration &&
                  <FlexColumn>
                      <FlexRow>
                          <p>{"Min"}</p>
                          <NumberInput placeholder={"Mínima"}
                                       value={tempFilters.minDuration}
                                       onChange={(value) => setTempFilters({...tempFilters, minDuration: value})}/>

                      </FlexRow>
                      <FlexRow>
                          <p>{"Max"}</p>
                          <NumberInput placeholder={"Máxima"}
                                       value={tempFilters.maxDuration}
                                       onChange={(value) => setTempFilters({...tempFilters, maxDuration: value})}/>
                      </FlexRow>
                  </FlexColumn>
              }
            </FlexColumn>
          </Box>
          {props.showInteractions &&
              <Box title={"Interacciones"}>
                  <FlexColumn>
                      <FlexRow position={"start"}>
                          <Checkbox checked={tempFilters.displayRecommended}
                                    onChange={(checked) => setTempFilters({
                                      ...tempFilters,
                                      displayRecommended: checked
                                    })}/>
                          <ThumbsUpFilledIcon/>
                          <label>{"Recomendado"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={tempFilters.displayDiscouraged}
                                    onChange={(checked) => setTempFilters({
                                      ...tempFilters,
                                      displayDiscouraged: checked
                                    })}/>
                          <ThumbsDownFilledIcon/>
                          <label>{"No recomendado"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={tempFilters.displayHidden}
                                    onChange={(checked) => setTempFilters({...tempFilters, displayHidden: checked})}/>
                          <ArchiveBoxFilledIcon/>
                          <label>{"Archivado"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={tempFilters.displayViewed}
                                    onChange={(checked) => setTempFilters({...tempFilters, displayViewed: checked})}/>
                          <CheckCircleFilledIcon/>
                          <label>{"Visto"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={tempFilters.displayWithoutInteraction}
                                    onChange={(checked) => setTempFilters({
                                      ...tempFilters,
                                      displayWithoutInteraction: checked
                                    })}/>
                          <CheckCircleIcon/>
                          <label>{"No visto"}</label>
                      </FlexRow>
                  </FlexColumn>
              </Box>
          }
        </FlexColumn>
      </Box>
      {props.editable &&
          <Box title={"Categorías"}>
              <Grid>
                {topicTags}
              </Grid>
          </Box>
      }
    </Sidebar>
  );
};

export default SubscriptionDetails;
