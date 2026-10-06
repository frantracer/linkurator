import {useEffect, useState} from "react";
import {areFiltersEqual, defaultFilters, Filters} from "../entities/Filters";
import useUserFilter from "./useUserFilter";

type UseFilters = {
  filters: Filters,
  setFilters: (filters: Filters) => void,
  resetFilters: () => void,
  isModified: boolean,
}

const useFilters = (): UseFilters => {
  const {userFilter, isLoading} = useUserFilter();
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  useEffect(() => {
    if (!isLoading) {
      setFilters(userFilter);
    }
  }, [userFilter, isLoading]);

  return {
    filters,
    setFilters,
    resetFilters: () => setFilters(userFilter),
    isModified: !areFiltersEqual(filters, userFilter),
  }
};

export default useFilters;
