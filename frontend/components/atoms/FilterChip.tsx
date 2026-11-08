import React from "react";
import classNames from "classnames";
import {ChevronDownIcon} from "./Icons";

type FilterChipProps = {
  active: boolean;
  children: React.ReactNode;
};

const FilterChip = ({active, children}: FilterChipProps) => (
  <span className={classNames(
    "flex flex-row items-center gap-1 whitespace-nowrap",
    {"text-primary": active}
  )}>
    {children}
    <ChevronDownIcon/>
  </span>
);

export default FilterChip;
