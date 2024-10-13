import React from "react";
import Link from "next/link";

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
  let className = "btn btn-sm rounded px-1";
  if (primary) {
    className += " btn-primary";
  } else {
    className += " btn-secondary";
  }
  if (fitContent) {
    className += " w-fit";
  } else {
    className += " w-full";
  }
  if (showOnlyOnMobile) {
    className += " lg:hidden";
  }
  if (disabled) {
    className += " opacity-50 cursor-not-allowed";
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
