import React from "react";

type ButtonProps = {
  href?: string
  clickAction?: () => void
  children?: React.ReactNode
}

const noAction = () => {
}

const Link = (
  {
    href = "",
    clickAction = noAction,
    children
  }: ButtonProps
) => {
  return (
    <a onClick={clickAction} className="group w-full rounded-none" href={href}>
      {children}
    </a>
  );
}

export default Link;
