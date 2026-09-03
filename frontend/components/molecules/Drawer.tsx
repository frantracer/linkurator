import React from "react";
import {hideLateralMenu, isLateralMenuOpen} from "../../utilities/lateralMenuAction";

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

  const handleClickOrTouchBackground = (event: React.MouseEvent | React.TouchEvent) => {
    const sidebarIsOpen = isLateralMenuOpen(id);
    if (sidebarIsOpen) {
      hideLateralMenu(id);
      event.stopPropagation();
    }
  }

  return (
    <div className={`drawer w-full h-full overflow-hidden ${sideContentClass} ${alwaysOpenClass}`}>
      <input id={id} type="checkbox" className="drawer-toggle"/>
      <div className="drawer-content flex flex-col w-full h-full min-h-0 overflow-y-auto">
        {mainContent}
      </div>
      <div className="drawer-side z-40">
        <label aria-label="close sidebar" className="drawer-overlay"
               onClick={handleClickOrTouchBackground}/>
        {sideContent}
      </div>
    </div>
  );
}

export default Drawer;
