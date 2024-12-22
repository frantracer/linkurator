import React from "react";

type DropdownProps = {
  button: React.ReactNode
  bottom?: boolean
  start?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    bottom = true,
    start = true,
    children
  }: DropdownProps) => {
  const verticalPosition = bottom ? "dropdown-bottom" : "dropdown-top";
  const horizontalPosition = start ? "dropdown-start" : "dropdown-end";

  return (
    <div className={"dropdown " + verticalPosition + " " + horizontalPosition}>
      <div tabIndex={0} role="button" className="btn btn-primary btn-sm rounded px-1 w-fit">{button}</div>
      <div tabIndex={0} className="dropdown-content bg-base-100 rounded-box z-[1] p-2 shadow w-72 max-h-96 overflow-y-auto">
        <ul>{children}</ul>
      </div>
    </div>
  )
}

export default Dropdown;