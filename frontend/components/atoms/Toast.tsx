import React, {useEffect, useState, useRef} from 'react';
import {CrossIcon, ArrowUturnLeft} from './Icons';
import {useTranslations} from 'next-intl';
import classNames from "classnames";

type ToastProps = {
  id: string;
  title: string;
  subtitle?: string;
  duration?: number;
  onClose: (id: string) => void;
  onUndo?: () => void;
}

export const Toast = ({id, title, subtitle, duration = 2200, onClose, onUndo}: ToastProps) => {
  const t = useTranslations("common");
  const [isVisible, setIsVisible] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for fade-out animation
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [id, duration, onClose]);

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Wait for fade-out animation
  };

  const handleUndo = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsVisible(false);
    if (onUndo) {
      onUndo();
    }
    setTimeout(() => onClose(id), 300); // Wait for fade-out animation
  };

  const toastClass = classNames(
    "alert alert-success shadow-lg flex flex-row items-start gap-2 transition-opacity duration-300 " +
    "bg-primary border-2 border-neutral w-80 md:w-96",
    {
      "opacity-100": isVisible,
      "opacity-0": !isVisible
    }
  );

  return (
    <div className={toastClass} role="alert">
      {onUndo && (
        <button
          onClick={handleUndo}
          className="btn btn-sm btn-ghost btn-circle"
          aria-label={t("undo")}
        >
          <ArrowUturnLeft/>
        </button>
      )}
      <div className="flex-grow flex flex-col gap-1">
        <span className="font-semibold">{title}</span>
        {subtitle && <span className="text-sm">{subtitle}</span>}
      </div>
      <button
        onClick={handleClose}
        className="btn btn-sm btn-ghost btn-circle"
        aria-label="Close"
      >
        <CrossIcon/>
      </button>
    </div>
  );
};
