export function scrollToDrawerTop() {
  const drawerContent = document.querySelector('.drawer');
  if (drawerContent) {
    drawerContent.scrollTop = 0;
  }
}
