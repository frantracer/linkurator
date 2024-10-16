import React from "react";
import Link from "next/link";

type ButtonProps = {
  href: string
  onClick?: () => void
  fitContent?: boolean
  children?: React.ReactNode
}

const ALink = (
  {
    href,
    onClick,
    children,
  }: ButtonProps
) => {
  const handleClick = onClick ? onClick : () => {
  }

  return (
    <Link className={"group w-fit h-fit flex"} href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default ALink;
