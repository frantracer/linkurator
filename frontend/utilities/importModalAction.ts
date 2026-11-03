export type ImportStep = "choose" | "spotify" | "opml";

export const OPEN_IMPORT_MODAL_EVENT = "linkurator:open-import-modal";

// The import modal is mounted once in the sidebar, so callers reach it through a window event
export function openImportModal(step: ImportStep = "choose"): void {
  window.dispatchEvent(new CustomEvent<ImportStep>(OPEN_IMPORT_MODAL_EVENT, {detail: step}));
}
