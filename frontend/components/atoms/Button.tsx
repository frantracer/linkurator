import React from "react";
import Link from "next/link";
import classNames from "classnames";

type ButtonProps = {
  clickAction?: () => void
  href?: string
  showOnlyOnMobile?: boolean
  hideOnMobile?: boolean
  fitContent?: boolean
  disabled?: boolean
  primary?: boolean
  borderless?: boolean
  danger?: boolean
  submit?: boolean
  tooltip?: string
  ariaLabel?: string
  ariaPressed?: boolean
  children?: React.ReactNode
  stopPropagation?: boolean
}

const Button = (
  {
    clickAction = undefined,
    href = undefined,
    showOnlyOnMobile = false,
    hideOnMobile = false,
    fitContent = true,
    disabled = false,
    primary = true,
    borderless = false,
    danger = false,
    submit = false,
    tooltip = undefined,
    ariaLabel = undefined,
    ariaPressed = undefined,
    stopPropagation = true,
    children
  }: ButtonProps
) => {
  const outline = !primary && !borderless && !danger;
  const className = classNames(
    "btn btn-sm rounded-md px-2 gap-1.5 font-medium flex-nowrap",
    {
      "btn-primary": primary && !danger,
      "btn-error": danger,
      "btn-outline border-base-content/30 text-base-content hover:!bg-base-content/10 hover:!border-base-content/60 hover:!text-base-content": outline,
      "btn-ghost text-base-content hover:!bg-base-content/10": borderless && !primary && !danger,
      "w-fit": fitContent,
      "flex-1 w-full": !fitContent,
      "lg:hidden": showOnlyOnMobile,
      "hidden lg:flex": hideOnMobile,
    }
  );

  const label = ariaLabel ?? tooltip;

  if (href && !disabled) {
    return (
      <Link href={href} className={className} title={tooltip} aria-label={label}>
        {children}
      </Link>
    );
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
    if (clickAction) {
      clickAction();
    }
  }

  return (
    <button
      type={submit ? "submit" : "button"}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      title={tooltip}
      aria-label={label}
      aria-pressed={ariaPressed}
    >
      {children}
    </button>
  );
}

export default Button;
