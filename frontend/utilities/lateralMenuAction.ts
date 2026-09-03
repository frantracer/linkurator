export function hideLateralMenu(menuId: string) {
  const lateralMenu = <HTMLInputElement>document.getElementById(menuId);
  if (lateralMenu) {
    lateralMenu.checked = false;
  }
}

export function showLateralMenu(menuId: string) {
  const lateralMenu = <HTMLInputElement>document.getElementById(menuId);
  if (lateralMenu) {
    lateralMenu.checked = true;
  }
}


export function isLateralMenuOpen(menuId: string): boolean {
  const lateralMenu = <HTMLInputElement>document.getElementById(menuId);
  return lateralMenu ? lateralMenu.checked : false;
}
