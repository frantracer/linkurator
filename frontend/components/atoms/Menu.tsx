type MenuProps = {
  isFullHeight?: boolean;
  children: React.ReactNode;
};

const Menu = (
  {
    isFullHeight = true,
    children
  }: MenuProps) => {
  const heightClass = isFullHeight ? 'h-full overflow-auto' : 'h-fit';
  const className = "bg-base-100 rounded " + heightClass;

  return (
    <nav className={className}>
      {children}
    </nav>
  );
}

export default Menu;
