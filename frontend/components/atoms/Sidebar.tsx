import classNames from 'classnames';

type SidebarProps = {
  left?: boolean;
  children: React.ReactNode;
};

const Sidebar = ({
  left = true,
  children
}: SidebarProps) => {
  return (
    <div className={classNames(
      "flex flex-col px-2 py-4 h-full w-80 bg-base-200 text-base-content gap-y-2 overflow-auto border-neutral",
      { 'border-r-2': left, 'border-l-2': !left }
    )}>
      {children}
    </div>
  );
}

export default Sidebar;
