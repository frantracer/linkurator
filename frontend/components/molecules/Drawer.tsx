import React, {useEffect} from "react";
import {hideLateralMenu, showLateralMenu} from "../../utilities/hideLateralMenu";

const SWIPE_DELTA = 100;

type DrawerProps = {
  id: string,
  sidebarIsOpen: boolean,
  openSidebar: () => void,
  closeSidebar: () => void,
  right?: boolean,
  alwaysOpenOnDesktop?: boolean,
  children?: React.ReactNode,
}

const Drawer = (
  {
    id,
    sidebarIsOpen,
    openSidebar,
    closeSidebar,
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
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const touchEndX = event.changedTouches[0].clientX;
    const delta = Math.abs(touchEndX - touchStartX);
    const swipeRight = touchEndX - touchStartX > 0;
    const swipeLeft = touchEndX - touchStartX < 0;
    const menuIsRight = right;
    const menuIsLeft = !right;

    if (delta > SWIPE_DELTA) {
      if (sidebarIsOpen && (menuIsRight && swipeRight || menuIsLeft && swipeLeft)) {
        closeSidebar();
        event.stopPropagation();
      } else if (!sidebarIsOpen && (menuIsRight && swipeLeft || menuIsLeft && swipeRight)) {
        openSidebar();
        event.stopPropagation();
      }
    }
  }

  const handleTouchOnBackground = (event: React.TouchEvent) => {
    if (sidebarIsOpen) {
      closeSidebar();
      event.stopPropagation();
    }
  }

  useEffect (() => {
    if (sidebarIsOpen) {
      showLateralMenu(id);
    } else {
      hideLateralMenu(id);
    }
  }, [id, sidebarIsOpen]);

  return (
    <div className={`drawer w-full h-full ${sideContentClass} ${alwaysOpenClass}`} onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}>
      <input id={id} type="checkbox" className="drawer-toggle" onTouchEnd={handleTouchOnBackground}/>
      <div className="drawer-content flex flex-col z-10 w-full h-full overflow-auto">
        {mainContent}
      </div>
      <div className="drawer-side z-20">
        <label htmlFor={id} aria-label="close sidebar" className="drawer-overlay" onTouchEnd={handleTouchOnBackground}/>
        {sideContent}
      </div>
    </div>
  );
}

export default Drawer;
