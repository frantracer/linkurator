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
    children
  }: ButtonProps
) => {
  const className = classNames(
    "btn btn-sm rounded px-1 btn-primary",
    {
      "btn-outline": !primary,
      "w-fit": fitContent,
      "w-full": !fitContent,
      "lg:hidden": showOnlyOnMobile,
      "opacity-50 cursor-not-allowed": disabled
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
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <label role={"button"} onClick={handleClick} htmlFor={relatedModalId} className={className}>
      {children}
    </label>
  );
}

export default Button;
