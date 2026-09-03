import React from 'react';
import { Toast } from '../atoms/Toast';

export type ToastData = {
  id: string;
  title: string;
  subtitle?: string;
  onUndo?: () => void;
}

type ToastContainerProps = {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

export const ToastContainer = ({ toasts, onRemoveToast }: ToastContainerProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          subtitle={toast.subtitle}
          onClose={onRemoveToast}
          onUndo={toast.onUndo}
        />
      ))}
    </div>
  );
};
