type SidebarProps = {
  children: React.ReactNode;
};

const Sidebar = ({children}: SidebarProps) => {
  return (
    <div className="flex flex-col px-2 py-4 h-full w-80 bg-base-200 text-base-content gap-y-2">
      {children}
    </div>
  );
}

export default Sidebar;
