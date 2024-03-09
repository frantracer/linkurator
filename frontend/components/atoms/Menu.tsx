type MenuProps = {
  children: React.ReactNode;
};

const Menu = (props: MenuProps) => {
  return (
    <nav className="bg-base-200 rounded h-full overflow-auto">
      {props.children}
    </nav>
  );
}

export default Menu;
