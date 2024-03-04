type MenuItemProps = {
  onClick: () => void;
  selected?: boolean;
  children?: React.ReactNode;
};

export const MenuItem = (props: MenuItemProps) => {
  const background = props.selected ? "bg-base-100" : "bg-transparent";

  return (
    <button
      onClick={props.onClick}
      className={`block p-2 text-sm w-full text-left rounded
    hover:bg-base-100/80 focus:outline-none focus:shadow-outline ${background}`}>
      {props.children}
    </button>
  )
};
