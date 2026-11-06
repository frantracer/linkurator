import React from "react";

export const GRID_CARD_MIN_WIDTH_REM = 20;
export const GRID_COLUMN_GAP_REM = 2.5;
export const GRID_ROW_GAP_REM = 2;
export const GRID_PADDING_REM = 1;

export const CONTENT_GRID_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill,minmax(min(100%,${GRID_CARD_MIN_WIDTH_REM}rem),1fr))`,
  columnGap: `${GRID_COLUMN_GAP_REM}rem`,
  rowGap: `${GRID_ROW_GAP_REM}rem`,
  padding: `${GRID_PADDING_REM}rem`,
};
