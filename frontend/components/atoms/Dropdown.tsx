import React, {useEffect, useId, useRef, useState} from "react";
import classNames from "classnames";

export type DropdownTriggerStyle = "outline" | "ghost" | "overlay" | "bare";

type DropdownProps = {
  button: React.ReactNode
  label: string
  triggerStyle?: DropdownTriggerStyle
  fullWidth?: boolean
  small?: boolean
  bottom?: boolean
  position?: "start" | "center" | "end"
  closeOnClickInside?: boolean
  children?: React.ReactNode
}

const Dropdown = (
  {
    button,
    label,
    triggerStyle = "outline",
    fullWidth = false,
    small = false,
    bottom = true,
    position = "start",
    closeOnClickInside = false,
    children
  }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuContentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
    }
  };

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

  const triggerClass = classNames({
    "btn btn-sm rounded-md px-2 gap-1.5 font-medium flex-nowrap btn-outline border-neutral text-base-content hover:!bg-base-content/5 hover:!text-primary hover:!border-primary": triggerStyle === "outline",
    "btn btn-sm rounded-md px-2 gap-1.5 font-medium flex-nowrap btn-ghost hover:!bg-base-content/10 hover:!text-primary": triggerStyle === "ghost",
    "btn btn-sm btn-circle border-0 shadow bg-black/70 text-white hover:bg-black/90": triggerStyle === "overlay",
    "rounded-full": triggerStyle === "bare",
    "btn-active !border-primary !text-primary": isOpen && (triggerStyle === "outline" || triggerStyle === "ghost"),
    "w-full": fullWidth,
  });

  return (
    <div className={classNames("flex-none flex justify-center", {"w-full": fullWidth})} onKeyDown={handleKeyDown}>
      <div className={classNames("relative", {"w-full": fullWidth})} ref={dropdownRef}>
        <button
          type="button"
          ref={triggerRef}
          className={triggerClass}
          aria-label={label}
          title={label}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls={menuId}
          onClick={() => setIsOpen(!isOpen)}
        >
          {button}
        </button>
        <div
          id={menuId}
          className={classNames(
            contentPositionClass,
            sizeClass,
            "bg-base-100 rounded-lg p-1 shadow-lg max-h-96 overflow-y-auto overflow-x-hidden border border-neutral"
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
