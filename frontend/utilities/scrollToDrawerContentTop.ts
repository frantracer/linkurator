export function scrollToDrawerContentTop() {
  const drawerContent = document.querySelector('.drawer-content');
  if (drawerContent) {
    drawerContent.scrollTop = 0;
  }
}