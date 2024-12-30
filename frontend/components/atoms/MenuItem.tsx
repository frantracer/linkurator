type MenuItemProps = {
  onClick?: () => void;
  hideMenuOnClick?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
};

export const MenuItem = (props: MenuItemProps) => {
  const background = props.selected ? "bg-base-100" : "bg-transparent";
  const hideMenuOnClick = props.hideMenuOnClick ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hideMenuOnClick) {
      (e.currentTarget as HTMLButtonElement).blur();
    }
    if (props.onClick) {
      props.onClick();
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`block p-2 text-sm w-full text-left rounded min-h-10
    hover:bg-base-100/80 focus:outline-none focus:shadow-outline ${background}`}>
      {props.children}
    </button>
  )
};
