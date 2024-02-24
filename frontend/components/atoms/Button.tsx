import React from "react";

type ButtonProps = {
  clickAction?: () => void
  relatedModalId?: string
  showOnlyOnMobile?: boolean
  fitContent?: boolean
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
    children
  }: ButtonProps
) => {
  let className = "btn btn-primary rounded-none";
  if (fitContent) {
    className += " w-fit";
  } else {
    className += " w-full";
  }
  if (showOnlyOnMobile) {
    className += " lg:hidden";
  }

  return (
    <label role={"button"} onClick={clickAction} htmlFor={relatedModalId} className={className}>
      {children}
    </label>
  );
}

export default Button;
