'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ToastContainer, ToastData } from '../components/molecules/ToastContainer';

const SUCCESS_TOAST_DURATION = 2200;
const ERROR_TOAST_DURATION = 5000;

type ToastContextType = {
  showToast: (title: string, subtitle?: string, onUndo?: () => void) => void;
  showErrorToast: (title: string, subtitle?: string, onRetry?: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations("common");
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const showToast = useCallback((title: string, subtitle?: string, onUndo?: () => void) => {
    const action = onUndo ? { label: t("undo"), onClick: onUndo } : undefined;
    addToast({ title, subtitle, action, variant: "success", duration: SUCCESS_TOAST_DURATION });
  }, [addToast, t]);

  const showErrorToast = useCallback((title: string, subtitle?: string, onRetry?: () => void) => {
    const action = onRetry ? { label: t("retry"), onClick: onRetry } : undefined;
    addToast({ title, subtitle, action, variant: "error", duration: ERROR_TOAST_DURATION });
  }, [addToast, t]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showErrorToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </ToastContext.Provider>
  );
};
