import React, {useCallback, useEffect, useId, useRef, useState} from "react";
import classNames from "classnames";

export type DropdownTriggerStyle = "outline" | "ghost" | "overlay" | "bare";

export type DropdownWidth = "narrow" | "medium" | "wide";

type DropdownProps = {
  button: React.ReactNode
  label: string
  triggerStyle?: DropdownTriggerStyle
  fullWidth?: boolean
  width?: DropdownWidth
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
    width = "wide",
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
          // A click with detail 0 comes from the keyboard (Enter/Space): keep focus on the dropdown
          if (event.detail === 0) {
            triggerRef.current?.focus();
          }
        }
      }
    };

    // Use capture phase to catch events before stopPropagation in MenuItem
    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [closeOnClickInside]);

  const focusableItems = useCallback((): HTMLElement[] => {
    if (!menuContentRef.current) {
      return [];
    }
    const candidates = menuContentRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'
    );
    // offsetParent is null for elements hidden with display: none, such as phone-only menu items
    return Array.from(candidates).filter(element => element.offsetParent !== null);
  }, []);

  const focusItem = useCallback((position: "first" | "last" | "next" | "previous") => {
    const items = focusableItems();
    if (items.length === 0) {
      return;
    }
    const current = items.indexOf(document.activeElement as HTMLElement);
    const index = {
      first: 0,
      last: items.length - 1,
      next: current < 0 ? 0 : (current + 1) % items.length,
      previous: current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length,
    }[position];
    items[index].focus();
  }, [focusableItems]);

  // Opening from the keyboard moves focus into the menu once it is rendered
  const [focusFirstItemOnOpen, setFocusFirstItemOnOpen] = useState(false);
  useEffect(() => {
    if (isOpen && focusFirstItemOnOpen) {
      setFocusFirstItemOnOpen(false);
      focusItem("first");
    }
  }, [isOpen, focusFirstItemOnOpen, focusItem]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    // Text and number fields inside a menu keep their own arrow key behaviour
    const target = event.target as HTMLElement;
    const isTextField = target.tagName === "TEXTAREA" ||
      (target.tagName === "INPUT" && !["checkbox", "radio"].includes((target as HTMLInputElement).type));
    if (isTextField) {
      return;
    }

    const onTrigger = target === triggerRef.current;
    if (!isOpen) {
      if (onTrigger && event.key === "ArrowDown") {
        event.preventDefault();
        setFocusFirstItemOnOpen(true);
        setIsOpen(true);
      }
      return;
    }

    const positions: Record<string, "first" | "last" | "next" | "previous"> = {
      ArrowDown: "next",
      ArrowUp: "previous",
      Home: "first",
      End: "last",
    };
    const position = positions[event.key];
    if (position) {
      event.preventDefault();
      focusItem(position);
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
    "w-48": width === "narrow",
    "w-64": width === "medium",
    "w-72": width === "wide",
  });

  const triggerClass = classNames({
    "btn btn-sm rounded-md px-2 gap-1.5 font-medium flex-nowrap btn-outline border-base-content/30 text-base-content hover:!bg-base-content/10 hover:!border-base-content/60 hover:!text-base-content": triggerStyle === "outline",
    "btn btn-sm rounded-md px-2 gap-1.5 font-medium flex-nowrap btn-ghost hover:!bg-base-content/10": triggerStyle === "ghost",
    "btn btn-sm btn-circle border-0 shadow bg-black/70 text-white hover:bg-black/90": triggerStyle === "overlay",
    "rounded-full": triggerStyle === "bare",
    "!bg-base-content/10 !border-base-content/60": isOpen && (triggerStyle === "outline" || triggerStyle === "ghost"),
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
