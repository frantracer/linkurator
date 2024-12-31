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
import { useTranslations } from "next-intl";

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
  const t = useTranslations("common");
  const curatorName = curator ? curator.username : "";
  const curatorAvatar = curator ? curator.avatar_url : "";

  const translatedDurationOptions = durationOptions.map(option => {
    return {
      key: option.key,
      label: t(option.label)
    }
  });

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
    <Sidebar left={false}>
      <FlexRow position={"center"}>
        <Avatar src={curatorAvatar} alt={curatorName}/>
        <span>{curatorName}</span>
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
        </FlexColumn>
      </Box>
    </Sidebar>
  );
};

export default CuratorDetails;
