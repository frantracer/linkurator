import React, {useEffect, useState} from "react";

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

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }

  useEffect(() => {
    setDropdownOpen(open);
  }, [open]);

  return (
    <details onClick={handleOpen} open={dropdownOpen} className={"dropdown " + verticalPosition + " " + horizontalPosition}>
      <summary className="btn btn-sm btn-primary border-0">{button}</summary>
      <div onClick={onClick} className="dropdown-content bg-base-100 rounded-box z-[1] p-2 shadow w-72 max-h-96 overflow-y-auto">
        {children}
      </div>
    </details>
  )
}

export default Dropdown;