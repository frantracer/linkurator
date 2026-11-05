import React from "react";
import Link from "next/link";
import classNames from "classnames";

type NavLinkProps = {
  href: string;
  selected: boolean;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  children: React.ReactNode;
}

const NavLink = ({href, selected, icon, trailing, onClick, children}: NavLinkProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={selected ? "page" : undefined}
      className={classNames(
        "relative flex flex-row items-center gap-3 px-3 min-h-10 rounded-lg text-sm transition-colors",
        "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0",
        "before:rounded-r-full before:bg-primary before:transition-all before:duration-200",
        {
          "bg-base-content/10 font-semibold text-base-content before:h-3/4": selected,
          "text-base-content/80 hover:bg-base-content/5 hover:text-base-content": !selected,
        }
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="flex-1 min-w-0 truncate">{children}</span>
      {trailing}
    </Link>
  );
}

export default NavLink;
