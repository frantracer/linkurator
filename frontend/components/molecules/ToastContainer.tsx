import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast, ToastAction, ToastVariant } from '../atoms/Toast';

export type ToastData = {
  id: string;
  title: string;
  subtitle?: string;
  variant: ToastVariant;
  duration: number;
  action?: ToastAction;
}

type ToastContainerProps = {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

// An open modal dialog sits in the top layer and makes the rest of the page inert,
// so toasts render inside it to stay visible and clickable
const findOpenModal = (): HTMLDialogElement | null => {
  const openModals = document.querySelectorAll<HTMLDialogElement>('dialog:modal');
  return openModals.length > 0 ? openModals[openModals.length - 1] : null;
};

export const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
  const [openModal, setOpenModal] = useState<HTMLDialogElement | null>(null);

  useEffect(() => {
    setOpenModal(findOpenModal());
    const observer = new MutationObserver(() => setOpenModal(findOpenModal()));
    observer.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
    return () => observer.disconnect();
  }, []);

  const container = (
    <div
      className="fixed z-[55] flex flex-col gap-2 inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96"
      role="region"
      aria-live="polite">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          subtitle={toast.subtitle}
          variant={toast.variant}
          duration={toast.duration}
          onClose={onRemoveToast}
          action={toast.action}
        />
      ))}
    </div>
  );

  return openModal ? createPortal(container, openModal) : container;
};
