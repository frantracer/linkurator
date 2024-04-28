import React from "react";

type ButtonProps = {
  clickAction?: () => void
  relatedModalId?: string
  showOnlyOnMobile?: boolean
  fitContent?: boolean
  disabled?: boolean
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
    children
  }: ButtonProps
) => {
  let className = "btn btn-primary rounded px-3";
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

  return (
    <label role={"button"} onClick={clickAction} htmlFor={relatedModalId} className={className}>
      {children}
    </label>
  );
}

export default Button;
