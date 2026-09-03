export function openModal(id: string): void {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) {
    modal.showModal();
  }
}

export function closeModal(id: string): void {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) {
    modal.close();
  }
}
