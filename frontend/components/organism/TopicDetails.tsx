import React, {useEffect, useState} from "react";
import {Subscription} from "../../entities/Subscription";
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
  CheckIcon,
  PencilIcon,
  ThumbsDownFilledIcon,
  ThumbsUpFilledIcon,
  TrashIcon
} from "../atoms/Icons";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {durationOptions, Filters} from "../../entities/Filters";
import Checkbox from "../atoms/Checkbox";
import NumberInput from "../atoms/NumberInput";
import {openModal} from "../../utilities/modalAction";
import Miniature from "../atoms/Miniature";
import ALink from "../atoms/ALink";
import Tag from "../atoms/Tag";
import Grid from "../atoms/Grid";
import {deleteTopic, followTopic, unfollowTopic} from "../../services/topicService";
import {EditTopicModalId} from "./EditTopicModal";
import Dropdown from "../atoms/Dropdown";
import {hideLateralMenu} from "../../utilities/lateralMenuAction";

export const TOPIC_DETAILS_ID = "topic-details";

type TopicDetailsProps = {
  subscriptions: Subscription[];
  topic: Topic | null,
  filters: Filters,
  showInteractions: boolean,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  refreshTopics: () => void;
};

const TopicDetails = (props: TopicDetailsProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);
  const [showCustomDuration, setShowCustomDuration] = useState<boolean>(false);

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
        hideLateralMenu(TOPIC_DETAILS_ID)
      })
  }

  const resetFilters = () => {
    props.resetFilters();
    setTempFilters(props.filters)
    if (props.filters.durationGroup == "custom") {
      setShowCustomDuration(true);
    } else {
      setShowCustomDuration(false);
    }
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

  const handleApplyFilters = () => {
    props.setFilters(tempFilters)
    hideLateralMenu(TOPIC_DETAILS_ID)
  }

  const handleFollowTopic = (topic_id: string) => {
    followTopic(topic_id)
      .then(() => {
        props.refreshTopics()
      })
  }

  const handleUnfollowTopic = (topic_id: string) => {
    unfollowTopic(topic_id)
      .then(() => {
        props.refreshTopics()
      })
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
        <div className="w-full whitespace-nowrap truncate text-center">{topicName}</div>
      </FlexRow>
      <Divider/>
      {props.topic?.is_owner &&
          <FlexRow position={"end"}>
              <Button clickAction={() => openModal(EditTopicModalId)}>
                  <PencilIcon/>
                {"Editar"}
              </Button>
              <Button clickAction={deleteTopicAction}>
                  <TrashIcon/>
                {"Borrar"}
              </Button>
          </FlexRow>
      }
      {props.topic !== null && !props.topic.is_owner && props.topic.followed &&
          <FlexRow position={"center"}>
              <Button clickAction={() => handleUnfollowTopic(topicId)}>
                {"Dejar de seguir"}
              </Button>
          </FlexRow>
      }
      {props.topic !== null && !props.topic.is_owner && !props.topic.followed &&
          <FlexRow position={"center"}>
              <Button clickAction={() => handleFollowTopic(topicId)}>
                {"Seguir"}
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
            <Button clickAction={handleApplyFilters}>
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
                          <Checkbox checked={tempFilters.displayWithoutInteraction}
                                    onChange={(checked) => setTempFilters({
                                      ...tempFilters,
                                      displayWithoutInteraction: checked
                                    })}/>
                          <CheckCircleIcon/>
                          <label>{"No visto"}</label>
                      </FlexRow>
                      <FlexRow position={"start"}>
                          <Checkbox checked={tempFilters.displayViewed}
                                    onChange={(checked) => setTempFilters({...tempFilters, displayViewed: checked})}/>
                          <CheckCircleFilledIcon/>
                          <label>{"Visto"}</label>
                      </FlexRow>
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
                  </FlexColumn>
              </Box>
          }
        </FlexColumn>
      </Box>
      <Box title={"Subscripciones"}>
        <Grid>
          {subsTags}
        </Grid>
      </Box>
    </Sidebar>
  );
};

export default TopicDetails;
