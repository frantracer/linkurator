import {useState} from "react";
import {Filters} from "../entities/Filters";

const useFilters = () => {
  const [filters, setFilters] = useState<Filters>({
    display_hidden: false,
    display_viewed: false,
    display_discouraged: false,
    display_recommended: true,
  });

  return [filters, setFilters] as const;
};

export default useFilters;