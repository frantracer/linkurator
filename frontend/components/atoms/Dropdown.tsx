import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";

type DropdownProps = {
  button: React.ReactNode
  bottom?: boolean
  position?: "start" | "center" | "end"
  borderless?: boolean
  closeOnClickInside?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    bottom = true,
    position = "start",
    borderless = false,
    closeOnClickInside = false,
    children
  }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current) {
        if (!dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        } else {
          if (closeOnClickInside) {
            setTimeout(() => {
              setIsOpen(false);
            }, 100);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [closeOnClickInside]);

  const buttonClass = classNames(
    "btn btn-sm rounded px-1 btn-primary w-fit",
    {
      "btn-ghost": borderless,
      "text-primary": borderless,
    }
  );

  const contentPositionClass = classNames(
    "absolute z-50 mt-1",
    {
      "top-full": bottom,
      "bottom-full mb-1": !bottom,
      "left-0": position === "start",
      "left-1/2 -translate-x-1/2": position === "center",
      "right-0": position === "end",
      "hidden": !isOpen,
    }
  );

  return (
    <div className="flex-none flex justify-center">
      <div className="relative">
        <div
          tabIndex={0}
          role="button"
          className={buttonClass}
          onClick={() => setIsOpen(!isOpen)}
        >
          {button}
        </div>
        <div
          tabIndex={0}
          className={classNames(
            contentPositionClass,
            "bg-base-200 rounded-lg p-0 shadow-lg w-72 max-h-96 overflow-y-auto border border-neutral"
          )}
          ref={dropdownRef}
        >
          <ul>{children}</ul>
        </div>
      </div>
    </div>
  );
}

export default Dropdown;