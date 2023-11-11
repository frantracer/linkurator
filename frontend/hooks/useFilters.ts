import {useState} from "react";
import {Filters} from "../entities/Filters";

type UseFilters = {
  filters: Filters,
  setFilters: (filters: Filters) => void,
  setDefaultFilters: () => void,
}

const defaultFilters: Filters = {
  display_hidden: false,
  display_viewed: false,
  display_discouraged: false,
  display_recommended: true,
  textSearch: "",
}

const useFilters = (): UseFilters => {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  return {filters, setFilters, setDefaultFilters: () => setFilters(defaultFilters)}
};

export default useFilters;
