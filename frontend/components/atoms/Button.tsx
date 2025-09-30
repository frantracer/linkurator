import React from "react";
import Link from "next/link";
import classNames from "classnames";

type ButtonProps = {
  clickAction?: () => void
  href?: string
  relatedModalId?: string
  showOnlyOnMobile?: boolean
  fitContent?: boolean
  disabled?: boolean
  primary?: boolean
  borderless?: boolean
  tooltip?: string
  children?: React.ReactNode
}

const noAction = () => {
}

const Button = (
  {
    clickAction = noAction,
    href = undefined,
    relatedModalId = undefined,
    showOnlyOnMobile = false,
    fitContent = true,
    disabled = false,
    primary = true,
    borderless = false,
    tooltip = undefined,
    children
  }: ButtonProps
) => {
  const className = classNames(
    "btn btn-sm rounded px-1 btn-primary",
    {
      "btn-outline": !primary && !borderless,
      "w-fit": fitContent,
      "flex-1": !fitContent,
      "w-full": !fitContent,
      "lg:hidden": showOnlyOnMobile,
      "opacity-50 cursor-not-allowed": disabled,
      "btn-ghost": borderless,
      "text-primary": borderless,
    }
  );

  if (disabled) {
    clickAction = noAction;
    relatedModalId = undefined;
  }

  const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.stopPropagation();
    if (clickAction) {
      clickAction();
    }
  }

  if (href) {
    return (
      <Link href={href} className={className} title={tooltip}>
        {children}
      </Link>
    );
  }

  return (
    <label role={"button"} onClick={handleClick} htmlFor={relatedModalId} className={className} title={tooltip}>
      {children}
    </label>
  );
}

export default Button;
