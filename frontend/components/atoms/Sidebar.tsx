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
      "flex flex-col px-2 py-4 h-full w-80 bg-base-100 text-base-content gap-y-4 overflow-auto border-neutral",
      { 'border-r-[1px]': left, 'border-l-[1px]': !left }
    )}>
      {children}
    </div>
  );
}

export default Sidebar;
