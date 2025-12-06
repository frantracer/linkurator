import {configuration} from "../configuration";
import axios from "axios";
import {defaultFilters, Filters, getFilterDuration} from "../entities/Filters";

type UserFilter = {
  min_duration: number | null;
  max_duration: number | null;
  include_items_without_interactions: boolean;
  include_recommended_items: boolean;
  include_discouraged_items: boolean;
  include_viewed_items: boolean;
  include_hidden_items: boolean;
};

const mapUserFilterToFilters = (userFilter: UserFilter | null): Filters => {
  if (!userFilter) {
    return defaultFilters;
  }

  // Determine durationGroup based on min/max values
  let durationGroup: "all" | "short" | "medium" | "long" | "custom" = "all";
  if (userFilter.min_duration === null && userFilter.max_duration === null) {
    durationGroup = "all";
  } else if (userFilter.min_duration === 0 && userFilter.max_duration === 119) {
    durationGroup = "short";
  } else if (userFilter.min_duration === 120 && userFilter.max_duration === 3599) {
    durationGroup = "medium";
  } else if (userFilter.min_duration === 3600 && userFilter.max_duration === 999999) {
    durationGroup = "long";
  } else {
    durationGroup = "custom";
  }

  return {
    textSearch: "",
    displayHidden: userFilter.include_hidden_items,
    displayViewed: userFilter.include_viewed_items,
    displayDiscouraged: userFilter.include_discouraged_items,
    displayRecommended: userFilter.include_recommended_items,
    displayWithoutInteraction: userFilter.include_items_without_interactions,
    durationGroup: durationGroup,
    minDuration: userFilter.min_duration !== null && durationGroup === "custom" ? userFilter.min_duration / 60 : undefined,
    maxDuration: userFilter.max_duration !== null && durationGroup === "custom" ? userFilter.max_duration / 60 : undefined,
    excludedSubscriptions: [],
  };
}

const mapFiltersToUserFilter = (filters: Filters): UserFilter => {
  const duration = getFilterDuration(filters);
  return {
    min_duration: duration.min !== undefined ? duration.min : null,
    max_duration: duration.max !== undefined ? duration.max : null,
    include_items_without_interactions: filters.displayWithoutInteraction,
    include_recommended_items: filters.displayRecommended,
    include_discouraged_items: filters.displayDiscouraged,
    include_viewed_items: filters.displayViewed,
    include_hidden_items: filters.displayHidden,
  };
}


export async function getUserFilter(): Promise<Filters | null> {
  try {
    const {data, status} = await axios.get<UserFilter>(configuration.USER_FILTER_URL, {withCredentials: true});
    if (status === 200) {
      return mapUserFilterToFilters(data);
    }
    return null;
  } catch (error) {
    return null;
  }
}

export async function upsertUserFilter(request: Filters): Promise<void> {
  const requestMapped = mapFiltersToUserFilter(request);
  const {status} = await axios.put(configuration.USER_FILTER_URL, requestMapped, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error upserting user filter");
  }
}

export async function deleteUserFilter(): Promise<void> {
  const {status} = await axios.delete(configuration.USER_FILTER_URL, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error deleting user filter");
  }
}
