import React from "react";

type ButtonProps = {
  clickAction?: () => void
  relatedModalId?: string
  showOnlyOnMobile?: boolean
  children?: React.ReactNode
}

const noAction = () => {
}

const Button = (
  {
    clickAction = noAction,
    relatedModalId = undefined,
    showOnlyOnMobile = false,
    children
  }: ButtonProps
) => {
  let className = "btn btn-primary w-fit rounded-none";
  if (showOnlyOnMobile) {
    className += " lg:hidden";
  }

  return (
    <label onClick={clickAction} htmlFor={relatedModalId} className={className}>
      {children}
    </label>
  );
}

export default Button;
