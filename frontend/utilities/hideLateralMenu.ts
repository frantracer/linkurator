export function hideLateralMenu(menuId: string) {
  const lateralMenu = <HTMLInputElement>document.getElementById(menuId);
  if (lateralMenu) {
    lateralMenu.checked = false;
  }
}
