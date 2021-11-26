type MenuItemProps = {
  title: string;
};

export const MenuItem = (props: MenuItemProps) => (
  <a
    className="block px-4 py-2 mt-2 text-sm font-semibold text-gray-900 rounded-lg hover:bg-blue-400 focus:bg-blue-400 focus:outline-none focus:shadow-outline"
    href="#"
  >
    {props.title}
  </a>
);
