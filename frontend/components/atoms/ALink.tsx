import React from "react";
import Link from "next/link";

type ButtonProps = {
  href: string
  children?: React.ReactNode
}

const ALink = (
  {
    href,
    children
  }: ButtonProps
) => {
  return (
    <Link className="group" href={href}>
      {children}
    </Link>
  );
}

export default ALink;
