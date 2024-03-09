import React from "react";

type DrawerProps = {
  id: string,
  right?: boolean,
  alwaysOpenOnDesktop?: boolean,
  children?: React.ReactNode,
}

const Drawer = (
  {
    id,
    right = false,
    alwaysOpenOnDesktop = true,
    children
  }: DrawerProps) => {
  const childrenArray = React.Children.toArray(children);
  const sideContent = childrenArray[0];
  const mainContent = childrenArray.slice(1, childrenArray.length);
  const sideContentClass = right ? "drawer-end" : "";
  const alwaysOpenClass = alwaysOpenOnDesktop ? "lg:drawer-open" : "";

  return (
    <div className={`drawer w-full h-full ${sideContentClass} ${alwaysOpenClass}`}>
      <input id={id} type="checkbox" className="drawer-toggle"/>
      <div className="drawer-content flex flex-col z-10 w-full h-full overflow-auto">
        {mainContent}
      </div>
      <div className="drawer-side z-20">
        <label htmlFor={id} aria-label="close sidebar" className="drawer-overlay"></label>
        {sideContent}
      </div>
    </div>
  );
}

export default Drawer;
