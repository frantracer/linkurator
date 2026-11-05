export type SearchFilter = "all" | "topics" | "subscriptions" | "curators";

export const OPEN_SEARCH_PALETTE_EVENT = "linkurator:open-search-palette";

// The palette is mounted once in the sidebar, so callers reach it through a window event
export function openSearchPalette(filter: SearchFilter = "all"): void {
  window.dispatchEvent(new CustomEvent<SearchFilter>(OPEN_SEARCH_PALETTE_EVENT, {detail: filter}));
}
