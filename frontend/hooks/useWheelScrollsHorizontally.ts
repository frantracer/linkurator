import {RefObject, useEffect} from "react";

const LINE_HEIGHT_PX = 16;

const canScrollHorizontally = (element: HTMLElement, delta: number): boolean => {
  if (delta > 0) {
    return element.scrollLeft + element.clientWidth < element.scrollWidth - 1;
  }
  return element.scrollLeft > 0;
};

// A mouse wheel only scrolls vertically, so horizontal strips turn it sideways until they reach their end
const useWheelScrollsHorizontally = (stripRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const isVerticalWheel = Math.abs(event.deltaY) > Math.abs(event.deltaX);
      if (event.ctrlKey || !isVerticalWheel || !canScrollHorizontally(strip, event.deltaY)) {
        return;
      }
      event.preventDefault();
      const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * LINE_HEIGHT_PX : event.deltaY;
      strip.scrollBy({left: delta});
    };

    strip.addEventListener("wheel", handleWheel, {passive: false});
    return () => strip.removeEventListener("wheel", handleWheel);
  }, [stripRef]);
};

export default useWheelScrollsHorizontally;
