import React, {useId} from "react";
import classNames from "classnames";
import {useTranslations} from "next-intl";
import {CrossIcon} from "./Icons";

export type ModalSize = "sm" | "md" | "lg";

type ModalProps = {
  id: string;
  title: string;
  size?: ModalSize;
  danger?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
};

const Modal = ({id, title, size = "md", danger = false, onClose, children}: ModalProps) => {
  const t = useTranslations("common");
  const titleId = useId();

  return (
    <dialog id={id} aria-labelledby={titleId} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className={classNames(
        "modal-box flex flex-col p-0 w-full max-w-none max-h-[90dvh] bg-base-100 border border-neutral rounded-b-none sm:rounded-2xl",
        sizeClasses[size]
      )}>
        <div className="flex flex-row items-center gap-2 px-5 pt-4 pb-3 border-b border-neutral">
          <h2 id={titleId} className={classNames("flex-1 text-lg font-semibold text-left", {"text-error": danger})}>
            {title}
          </h2>
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost" aria-label={t("close")} title={t("close")}>
              <CrossIcon/>
            </button>
          </form>
        </div>
        <div className="overflow-y-auto overflow-x-hidden px-5 py-4">
          {children}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button tabIndex={-1} aria-hidden="true">{t("close")}</button>
      </form>
    </dialog>
  )
}

export default Modal;
