import React, {Children, useEffect, useState} from "react";

type DropdownProps = {
  button: React.ReactNode
  open?: boolean
  onChange?: (open: boolean) => void
  bottom?: boolean
  start?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    open = false,
    onChange = () => {},
    bottom = true,
    start = true,
    children
  }: DropdownProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(open);

  const verticalPosition = bottom ? "dropdown-bottom" : "dropdown-top";
  const horizontalPosition = start ? "dropdown-start" : "dropdown-end";

  const handleOpen = (e: any) => {
    e.preventDefault();
    onChange(!dropdownOpen);
    setDropdownOpen(!dropdownOpen);
  }

  useEffect(() => {
    setDropdownOpen(open);
  }, [open]);

  return (
    <details onClick={handleOpen} open={dropdownOpen} className={"dropdown " + verticalPosition + " " + horizontalPosition}>
      <summary className="btn btn-sm m-1 btn-primary border-0">{button}</summary>
      <ul className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
        {
          Children.map(children, (child, index) => {
            return <li className="my-0.5" key={index}>{child}</li>
          })
        }
      </ul>
    </details>
  )
}

export default Dropdown;