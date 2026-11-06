import {useEffect, useState} from "react";
import {areFiltersEqual, Filters} from "../entities/Filters";
import useUserFilter from "./useUserFilter";

type UseFilters = {
  filters: Filters,
  setFilters: (filters: Filters) => void,
  resetFilters: () => void,
  isModified: boolean,
  savedFilters: Filters,
}

const useFilters = (): UseFilters => {
  const {userFilter, isLoading} = useUserFilter();
  const [filters, setFilters] = useState<Filters>(userFilter);

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
    savedFilters: userFilter,
  }
};

export default useFilters;
