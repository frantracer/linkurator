import React from "react";
import {className} from "postcss-selector-parser";
import classNames from "classnames";

type DropdownProps = {
  button: React.ReactNode
  bottom?: boolean
  start?: boolean
  borderless?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    bottom = true,
    start = true,
    borderless = false,
    children
  }: DropdownProps) => {
  const verticalPosition = bottom ? "dropdown-bottom" : "dropdown-top";
  const horizontalPosition = start ? "dropdown-start" : "dropdown-end";

  const buttonClass = classNames(
    "btn btn-primary btn-sm rounded px-1 w-fit",
    {
      "btn-ghost": borderless,
      "text-primary": borderless,
    }
  )

  return (
    <div className="flex-1 flex justify-center">
      <div className={"dropdown " + verticalPosition + " " + horizontalPosition}>
        <div tabIndex={0} role="button" className={buttonClass}>{button}</div>
        <div tabIndex={0}
             className="dropdown-content bg-base-100 rounded-box z-1 p-2 shadow w-72 max-h-96 overflow-y-auto border-2 border-neutral">
          <ul>{children}</ul>
        </div>
      </div>
    </div>
  )
}

export default Dropdown;