import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";

type DropdownProps = {
  button: React.ReactNode
  bottom?: boolean
  position?: "start" | "center" | "end"
  borderless?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    bottom = true,
    position = "start",
    borderless = false,
    children
  }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    }
  );

  return (
    <div className="flex-none flex justify-center" ref={dropdownRef}>
      <div className="relative">
        <div
          tabIndex={0}
          role="button"
          className={buttonClass}
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
        >
          {button}
        </div>
        {isOpen && (
          <div
            tabIndex={0}
            className={classNames(
              contentPositionClass,
              "bg-base-200 rounded-lg p-2 shadow-lg w-72 max-h-96 overflow-y-auto border border-primary"
            )}
          >
            <ul>{children}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dropdown;