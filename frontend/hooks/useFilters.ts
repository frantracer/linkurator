import {useState} from "react";
import {Filters} from "../entities/Filters";

type UseFilters = {
  filters: Filters,
  setFilters: (filters: Filters) => void,
  setDefaultFilters: () => void,
}

const defaultFilters: Filters = {
  textSearch: "",
  displayHidden: false,
  displayViewed: false,
  displayDiscouraged: false,
  displayRecommended: false,
  displayWithoutInteraction: true,
  minDuration: 61,
  maxDuration: 100000,
}

const useFilters = (): UseFilters => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  return {filters, setFilters, setDefaultFilters: () => setFilters(defaultFilters)}
};

export default useFilters;
