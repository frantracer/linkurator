export const LATERAL_MENU_ID = 'lateral-menu';

export function hideLateralMenu() {
  const lateralMenu = <HTMLInputElement>document.getElementById(LATERAL_MENU_ID);
  if (lateralMenu) {
    lateralMenu.checked = false;
  }
}
