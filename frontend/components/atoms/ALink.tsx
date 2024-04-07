import React from "react";
import Link from "next/link";

type ButtonProps = {
  href: string
  onClick?: () => void
  children?: React.ReactNode
}

const ALink = (
  {
    href,
    onClick,
    children
  }: ButtonProps
) => {
  const handleClick = onClick ? onClick : () => {
  }

  return (
    <Link className="group" href={href} onClick={handleClick}>
      {children}
    </Link>
  );
}

export default ALink;
