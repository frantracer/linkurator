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
        "flex flex-row items-center gap-3 px-3 min-h-10 rounded-lg text-sm transition-colors",
        {
          "bg-base-content/10 font-semibold text-base-content": selected,
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
