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
    fitContent = true,
    children,
  }: ButtonProps
) => {
  const handleClick = onClick ? onClick : () => {
  }

  const className = fitContent ? "" : "w-full";

  return (
    <Link className={"group " + className} href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default ALink;
