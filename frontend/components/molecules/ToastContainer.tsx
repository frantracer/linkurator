import React from 'react';
import { Toast, ToastVariant } from '../atoms/Toast';

export type ToastData = {
  id: string;
  title: string;
  subtitle?: string;
  variant: ToastVariant;
  duration: number;
  onUndo?: () => void;
}

type ToastContainerProps = {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
  return (
    <div
      className="fixed z-[55] flex flex-col gap-2 inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] lg:inset-x-auto lg:right-4 lg:bottom-4 lg:w-96"
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
          onUndo={toast.onUndo}
        />
      ))}
    </div>
  );
};
