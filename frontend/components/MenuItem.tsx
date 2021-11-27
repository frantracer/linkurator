type MenuItemProps = {
  title: string;
  onClick: () => void;
  selected?: boolean;
};

export const MenuItem = (props: MenuItemProps) => (
  <button
    onClick={props.onClick}
    className={`block px-4 py-2 mt-2 text-sm w-full text-left font-semibold text-gray-900 rounded-lg hover:bg-blue-400 focus:outline-none focus:shadow-outline ${
      props.selected ? "focus:bg-blue-400" : ""
    }`}
  >
    {props.title}
  </button>
);
