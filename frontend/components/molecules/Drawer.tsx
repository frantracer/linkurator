import React from "react";
import {hideLateralMenu, isLateralMenuOpen, showLateralMenu} from "../../utilities/hideLateralMenu";

const SWIPE_DELTA = 100;

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
  const [touchStartX, setTouchStartX] = React.useState<number>(0);

  const childrenArray = React.Children.toArray(children);
  const sideContent = childrenArray[0];
  const mainContent = childrenArray.slice(1, childrenArray.length);
  const sideContentClass = right ? "drawer-end" : "";
  const alwaysOpenClass = alwaysOpenOnDesktop ? "lg:drawer-open" : "";

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartX(event.touches[0].clientX);
    const sidebarIsOpen = isLateralMenuOpen(id);
    if (sidebarIsOpen) {
      event.stopPropagation();
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const touchEndX = event.changedTouches[0].clientX;
    const delta = Math.abs(touchEndX - touchStartX);
    const swipeRight = touchEndX - touchStartX > 0;
    const swipeLeft = touchEndX - touchStartX < 0;
    const menuIsRight = right;
    const menuIsLeft = !right;
    const sidebarIsOpen = isLateralMenuOpen(id);

    if (delta > SWIPE_DELTA) {
      if (sidebarIsOpen && (menuIsRight && swipeRight || menuIsLeft && swipeLeft)) {
        hideLateralMenu(id);
        event.stopPropagation();
      } else if (!sidebarIsOpen && (menuIsRight && swipeLeft || menuIsLeft && swipeRight)) {
        showLateralMenu(id);
        event.stopPropagation();
      }
    }
  }

  const handleClickOrTouchBackground = (event: React.MouseEvent | React.TouchEvent) => {
    const sidebarIsOpen = isLateralMenuOpen(id);
    if (sidebarIsOpen) {
      hideLateralMenu(id);
      event.stopPropagation();
    }
  }

  return (
    <div className={`drawer w-full h-full ${sideContentClass} ${alwaysOpenClass}`}>
      <input id={id} type="checkbox" className="drawer-toggle"/>
      <div className="drawer-content flex flex-col z-10 w-full h-full overflow-auto"
           onTouchStart={handleTouchStart}
           onTouchEndCapture={handleTouchEnd}>
        {mainContent}
      </div>
      <div className="drawer-side z-20"
           onTouchStartCapture={handleTouchStart}
           onTouchEndCapture={handleTouchEnd}>
        <label aria-label="close sidebar" className="drawer-overlay"
               onTouchStartCapture={handleTouchStart}
               onTouchEndCapture={handleTouchEnd}
               onClick={handleClickOrTouchBackground}/>
        {sideContent}
      </div>
    </div>
  );
}

export default Drawer;
