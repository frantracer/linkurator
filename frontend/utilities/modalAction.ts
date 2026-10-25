export function openModal(id: string): void {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) {
    modal.showModal();
    // Modals stay on the page while closed, so React's autoFocus fires on page load and opens the keyboard.
    // Focusing inside the click handler is what iOS needs to show the keyboard, a dialog toggle listener runs too late.
    // It avoids the browser's own autofocus attribute, which React doesn't write into the HTML and
    // would need a ref plus setAttribute workaround.
    modal.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }
}

export function closeModal(id: string): void {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) {
    modal.close();
  }
}
