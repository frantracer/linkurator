import classNames from "classnames";

type MenuItemProps = {
  onClick?: () => void;
  hideMenuOnClick?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
};

export const MenuItem = (props: MenuItemProps) => {
  const itemClassNames = classNames(
    "relative block p-2 text-sm w-full text-left rounded rounded-lg min-h-12",
    "hover:text-primary focus:outline-none focus:shadow-outline",
    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
    "before:h-0 before:w-1 before:rounded-r-full before:bg-primary",
    "before:transition-all before:duration-200",
    {
      "bg-base-200 text-primary before:h-3/4": props.selected,
    }
  );

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (props.hideMenuOnClick) {
      (e.currentTarget as HTMLButtonElement).blur();
    }
    if (props.onClick) {
      props.onClick();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={itemClassNames}
    >
      {props.children}
    </button>
  )
};
