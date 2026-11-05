import {useEffect, useState} from "react";

// Mirrors GRID_CLASS in ContentItemCardGrid: 17.5rem minimum columns, 1rem gaps and 1rem padding
const GRID_CARD_MIN_WIDTH_REM = 17.5;
const GRID_GAP_REM = 1;
const GRID_PADDING_REM = 1;

const gridCardWidth = (containerWidth: number, rem: number): number => {
  const available = containerWidth - 2 * GRID_PADDING_REM * rem;
  const gap = GRID_GAP_REM * rem;
  const columns = Math.max(1, Math.floor((available + gap) / (GRID_CARD_MIN_WIDTH_REM * rem + gap)));
  return (available - (columns - 1) * gap) / columns;
};

// Width a card gets in the content grids, so other lists can show cards at the same size
const useGridCardWidth = (): number | undefined => {
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (!mainContent) {
      return;
    }
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const observer = new ResizeObserver(() => setWidth(gridCardWidth(mainContent.clientWidth, rem)));
    observer.observe(mainContent);
    return () => observer.disconnect();
  }, []);

  return width;
};

export default useGridCardWidth;
