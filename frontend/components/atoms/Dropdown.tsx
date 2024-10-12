import React, {Children} from "react";

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
      <div tabIndex={0} role="button" className="btn btn-sm m-1 bg-primary">{button}</div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        {
          Children.map(children, (child, index) => {
            return <li className="my-0.5" key={index}>{child}</li>
          })
        }
      </ul>
    </div>
  )
}

export default Dropdown;