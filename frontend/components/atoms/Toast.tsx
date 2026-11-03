import React, {useCallback, useEffect, useRef, useState} from 'react';
import {CheckCircleFilledIcon, CrossIcon, ExclamationCircle} from './Icons';
import {useTranslations} from 'next-intl';
import classNames from "classnames";

export type ToastVariant = "success" | "error";

type ToastProps = {
  id: string;
  title: string;
  subtitle?: string;
  variant: ToastVariant;
  duration: number;
  onClose: (id: string) => void;
  onUndo?: () => void;
}

const FADE_OUT_MS = 300;

export const Toast = ({id, title, subtitle, variant, duration, onClose, onUndo}: ToastProps) => {
  const t = useTranslations("common");
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
    setTimeout(() => onClose(id), FADE_OUT_MS);
  }, [id, onClose]);

  // Restarting the full duration on resume keeps the logic simple and errs on the side of reading time
  useEffect(() => {
    if (isPaused) {
      return;
    }
    timerRef.current = setTimeout(dismiss, duration);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, dismiss, isPaused]);

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
    }
    dismiss();
  };

  const toastClass = classNames(
    "flex flex-row items-center gap-3 w-full rounded-xl border px-4 py-3 shadow-lg transition-opacity duration-300",
    "bg-base-100 text-base-content",
    {
      "border-neutral": variant === "success",
      "border-error": variant === "error",
      "opacity-100": isVisible,
      "opacity-0": !isVisible
    }
  );

  return (
    <div
      className={toastClass}
      role={variant === "error" ? "alert" : "status"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <span className={variant === "error" ? "text-error" : "text-primary"}>
        {variant === "error" ? <ExclamationCircle/> : <CheckCircleFilledIcon/>}
      </span>
      <div className="flex-grow flex flex-col min-w-0">
        <span className="text-sm font-semibold">{title}</span>
        {subtitle && <span className="text-xs text-base-content/70">{subtitle}</span>}
      </div>
      {onUndo && (
        <button onClick={handleUndo} className="btn btn-sm btn-ghost text-primary px-2">
          {t("undo")}
        </button>
      )}
      <button
        onClick={dismiss}
        className="btn btn-sm btn-ghost btn-circle"
        aria-label={t("close")}
      >
        <CrossIcon/>
      </button>
    </div>
  );
};
