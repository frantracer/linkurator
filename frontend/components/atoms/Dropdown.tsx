import React, { useState, useRef, useEffect } from "react";
import classNames from "classnames";

type DropdownProps = {
  button: React.ReactNode
  small?: boolean
  bottom?: boolean
  position?: "start" | "center" | "end"
  closeOnClickInside?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    small = false,
    bottom = true,
    position = "start",
    closeOnClickInside = false,
    children
  }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current) {
        const clickedInsideDropdown = dropdownRef.current.contains(event.target as Node);
        const clickedMenuContent = menuContentRef.current && menuContentRef.current.contains(event.target as Node)
        if (!clickedInsideDropdown) {
          setIsOpen(false);
        }
        if (clickedInsideDropdown && clickedMenuContent && closeOnClickInside) {
          setIsOpen(false);
        }
      }
    };

    // Use capture phase to catch events before stopPropagation in MenuItem
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [closeOnClickInside]);

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

  const sizeClass = classNames({
    "w-48": small,
    "w-72": !small,
  });

  return (
    <div className="flex-none flex justify-center">
      <div className="relative" ref={dropdownRef}>
        <div
          tabIndex={0}
          role="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {button}
        </div>
        <div
          tabIndex={0}
          className={classNames(
            contentPositionClass,
            sizeClass,
            "bg-base-200 rounded-lg p-0 shadow-lg max-h-96 overflow-y-auto border border-neutral"
          )}
          ref={menuContentRef}
        >
          <ul>{children}</ul>
        </div>
      </div>
    </div>
  );
}

export default Dropdown;