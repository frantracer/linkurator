import React, {useEffect, useState} from "react";
import {Curator} from "../../entities/Curators";
import Sidebar from "../atoms/Sidebar";
import FlexRow from "../atoms/FlexRow";
import Divider from "../atoms/Divider";
import {ArrowUturnLeft, CheckIcon} from "../atoms/Icons";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {durationOptions, Filters} from "../../entities/Filters";
import NumberInput from "../atoms/NumberInput";
import {followCurator, unfollowCurator} from "../../services/curatorService";
import Select from "../atoms/Select";
import {hideLateralMenu} from "../../utilities/lateralMenuAction";

export const CURATOR_DETAILS_ID = "curator-details";

type CuratorDetailsProps = {
  curator: Curator | null,
  filters: Filters,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
  refreshCurators: () => void;
};

const CuratorDetails = (props: CuratorDetailsProps) => {
  const [tempFilters, setTempFilters] = useState<Filters>(props.filters);
  const [showCustomDuration, setShowCustomDuration] = useState<boolean>(false);

  const curatorId = props.curator ? props.curator.id : "";
  const curatorName = props.curator ? props.curator.username : "";

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
    hideLateralMenu(CURATOR_DETAILS_ID)
  }

  const handleFollowCurator = (curator_id: string) => {
    followCurator(curator_id)
      .then(() => {
        props.refreshCurators()
      })
  }

  const handleUnfollowCurator = (curator_id: string) => {
    unfollowCurator(curator_id)
      .then(() => {
        props.refreshCurators()
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
        <div className="w-full whitespace-nowrap truncate text-center">{curatorName}</div>
      </FlexRow>
      <Divider/>
      {props.curator !== null && props.curator.followed &&
          <FlexRow position={"center"}>
              <Button clickAction={() => handleUnfollowCurator(curatorId)}>
                {"Dejar de seguir"}
              </Button>
          </FlexRow>
      }
      {props.curator !== null && !props.curator.followed &&
          <FlexRow position={"center"}>
              <Button clickAction={() => handleFollowCurator(curatorId)}>
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
              <Select selected={tempFilters.durationGroup} options={durationOptions} onChange={handleDurationChange}/>
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
        </FlexColumn>
      </Box>
    </Sidebar>
  );
};

export default CuratorDetails;
