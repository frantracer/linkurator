import React from "react";
import {Curator} from "../../entities/Curators";
import Sidebar from "../atoms/Sidebar";
import FlexRow from "../atoms/FlexRow";
import Divider from "../atoms/Divider";
import {ArrowUturnLeft} from "../atoms/Icons";
import Button from "../atoms/Button";
import Box from "../atoms/Box";
import SearchBar from "../molecules/SearchBar";
import FlexColumn from "../atoms/FlexColumn";
import {durationOptions, Filters} from "../../entities/Filters";
import NumberInput from "../atoms/NumberInput";
import Select from "../atoms/Select";
import FlexItem from "../atoms/FlexItem";
import Avatar from "../atoms/Avatar";

export const CURATOR_DETAILS_ID = "curator-details";

type CuratorDetailsProps = {
  curator: Curator | null,
  filters: Filters,
  setFilters: (filters: Filters) => void;
  resetFilters: () => void;
};

const CuratorDetails = (
  {
    curator,
    filters,
    setFilters,
    resetFilters,
  }: CuratorDetailsProps
) => {
  const curatorName = curator ? curator.username : "";
  const curatorAvatar = curator ? curator.avatar_url : "";

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

  const showCustomDuration = filters.durationGroup == "custom";

  return (
    <Sidebar>
      <FlexRow position={"center"}>
        <Avatar src={curatorAvatar} alt={curatorName}/>
        <span>{curatorName}</span>
      </FlexRow>
      <Divider/>
      <FlexRow position={"between"}>
        <FlexItem grow={true}>
          <Button fitContent={false} clickAction={resetFilters}>
            <ArrowUturnLeft/>
            {"Restaurar"}
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
        </FlexColumn>
      </Box>
    </Sidebar>
  );
};

export default CuratorDetails;
