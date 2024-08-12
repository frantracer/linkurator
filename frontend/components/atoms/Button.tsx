import React from "react";

type ButtonProps = {
  clickAction?: () => void
  relatedModalId?: string
  showOnlyOnMobile?: boolean
  fitContent?: boolean
  disabled?: boolean
  grow?: boolean
  children?: React.ReactNode
}

const noAction = () => {
}

const Button = (
  {
    clickAction = noAction,
    relatedModalId = undefined,
    showOnlyOnMobile = false,
    fitContent = true,
    disabled = false,
    grow = true,
    children
  }: ButtonProps
) => {
  let className = "btn btn-sm btn-primary rounded px-1";
  if (fitContent) {
    className += " w-fit";
  } else {
    className += " w-full";
  }
  if (showOnlyOnMobile) {
    className += " lg:hidden";
  }
  if (grow) {
    className += " grow";
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

  return (
    <label role={"button"} onClick={handleClick} htmlFor={relatedModalId} className={className}>
      {children}
    </label>
  );
}

export default Button;
