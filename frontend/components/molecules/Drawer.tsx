import React from "react";

type DrawerProps = {
  id: string,
  children?: React.ReactNode,
}

const Drawer = (props: DrawerProps) => {
  const children = React.Children.toArray(props.children);
  const sideContent = children[0];
  const mainContent = children.slice(1, children.length);

  return (
    <div className="drawer lg:drawer-open w-full h-full">
      <input id={props.id} type="checkbox" className="drawer-toggle"/>
      <div className="drawer-content flex flex-col z-10 w-full h-full overflow-auto">
        {mainContent}
      </div>
      <div className="drawer-side z-20">
        <label htmlFor={props.id} aria-label="close sidebar" className="drawer-overlay"></label>
        {sideContent}
      </div>
    </div>
  );
}

export default Drawer;
