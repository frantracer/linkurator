import React from "react";

type DropdownOptionRowProps = {
  children: React.ReactNode;
}

const DropdownOptionRow = ({children}: DropdownOptionRowProps) => (
  <label
    className="flex flex-row gap-2 items-center min-w-0 px-2 py-1.5 rounded-md cursor-pointer hover:bg-base-content/5 text-sm">
    {children}
  </label>
);

export default DropdownOptionRow;
