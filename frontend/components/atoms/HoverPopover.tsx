'use client';

import React, {useEffect, useLayoutEffect, useRef, useState} from "react";

type HoverPopoverProps = {
  trigger: React.ReactNode;
  label: string;
  children?: React.ReactNode;
}

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 6;

// Opens on mouse hover, or on tap/Enter. Fixed positioning keeps scrolling parents from clipping it.
const HoverPopover = ({trigger, label, children}: HoverPopoverProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number, left: number } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const lastPointerTypeRef = useRef<string>('touch');

  useLayoutEffect(() => {
    if (!isOpen || !wrapperRef.current || !popupRef.current) {
      setPosition(null);
      return;
    }
    const anchor = wrapperRef.current.getBoundingClientRect();
    const popup = popupRef.current.getBoundingClientRect();
    const maxLeft = window.innerWidth - popup.width - VIEWPORT_MARGIN;
    const left = Math.max(VIEWPORT_MARGIN, Math.min(anchor.right - popup.width, maxLeft));
    const fitsBelow = anchor.bottom + TRIGGER_GAP + popup.height <= window.innerHeight - VIEWPORT_MARGIN;
    setPosition({
      left,
      top: fitsBelow ? anchor.bottom + TRIGGER_GAP : Math.max(VIEWPORT_MARGIN, anchor.top - TRIGGER_GAP - popup.height),
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) close();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    // Capture, so scrolling any container closes it.
    document.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('scroll', close, true);
    };
  }, [isOpen]);

  const handlePointerEnter = (event: React.PointerEvent) => {
    lastPointerTypeRef.current = event.pointerType;
    if (event.pointerType === 'mouse') setIsOpen(true);
  };

  const handlePointerLeave = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse') setIsOpen(false);
  };

  const handleClick = () => {
    // A mouse click follows the hover that opened it, so it must not toggle it closed.
    setIsOpen(open => lastPointerTypeRef.current === 'mouse' ? true : !open);
  };

  return (
    <span ref={wrapperRef} className="inline-flex"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onPointerDown={(event) => {
            lastPointerTypeRef.current = event.pointerType;
          }}>
      <button type="button" aria-label={label} aria-expanded={isOpen} onClick={handleClick}
              className="inline-flex items-center opacity-70 hover:opacity-100 cursor-pointer">
        {trigger}
      </button>
      {isOpen &&
          <div ref={popupRef} role="tooltip"
               className="fixed z-[70] w-64 max-w-[calc(100vw-1rem)] rounded-lg border border-neutral bg-base-200
                          p-2 text-left text-base-content shadow-lg"
               style={{top: position?.top ?? 0, left: position?.left ?? 0, visibility: position ? 'visible' : 'hidden'}}>
            {children}
          </div>
      }
    </span>
  );
};

export default HoverPopover;
