import classNames from "classnames";

type MenuItemProps = {
  onClick?: () => void;
  hideMenuOnClick?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
};

export const MenuItem = (props: MenuItemProps) => {
  const itemClassNames = classNames(
    "block p-2 text-sm w-full text-left rounded rounded-lg min-h-10",
    "hover:text-primary focus:outline-none focus:shadow-outline",
    {
      "bg-base-200 text-primary": props.selected,
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
