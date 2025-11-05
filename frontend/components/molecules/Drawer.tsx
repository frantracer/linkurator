import React from "react";
import {hideLateralMenu, isLateralMenuOpen, showLateralMenu} from "../../utilities/lateralMenuAction";

const SWIPE_DELTA = 150;
const MAX_SWIPE_ANGLE = 30; // degrees

type TouchPosition = {
  x: number,
  y: number,
}

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
  const [touchStart, setTouchStart] = React.useState<TouchPosition>({x: 0, y: 0});

  const childrenArray = React.Children.toArray(children);
  const sideContent = childrenArray[0];
  const mainContent = childrenArray.slice(1, childrenArray.length);
  const sideContentClass = right ? "drawer-end" : "";
  const alwaysOpenClass = alwaysOpenOnDesktop ? "lg:drawer-open" : "";

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStart({
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    });
    const sidebarIsOpen = isLateralMenuOpen(id);
    if (sidebarIsOpen) {
      event.stopPropagation();
    }
  }

  const handleTouchEnd = (event: React.TouchEvent) => {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStart.x;
    const deltaY = touchEndY - touchStart.y;
    const delta = Math.abs(deltaX);

    const swipeRight = deltaX > 0;
    const swipeLeft = deltaX < 0;
    const menuIsRight = right;
    const menuIsLeft = !right;
    const sidebarIsOpen = isLateralMenuOpen(id);

    // Calculate angle from horizontal (in degrees)
    let angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
    if (menuIsRight) {
      angle = Math.abs(angle - 180);
    }

    // Only process swipe if angle is below MAX_SWIPE_ANGLE (more horizontal)
    if (delta > SWIPE_DELTA && angle < MAX_SWIPE_ANGLE) {
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
      <div className="drawer-content flex flex-col z-20 w-full h-full overflow-y-auto"
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
