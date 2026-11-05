import React, {useState} from "react";
import {useTranslations} from "next-intl";
import Modal from "../atoms/Modal";
import Button from "../atoms/Button";
import InputText from "../atoms/InputText";
import {closeModal} from "../../utilities/modalAction";

type ConfirmDialogProps = {
  id: string;
  title: string;
  message: string;
  confirmLabel: string;
  busyLabel?: string;
  errorMessage: string;
  onConfirm: () => Promise<void>;
  danger?: boolean;
  confirmationText?: string;
  confirmationInstruction?: string;
}

const ConfirmDialog = (
  {
    id,
    title,
    message,
    confirmLabel,
    busyLabel = undefined,
    errorMessage,
    onConfirm,
    danger = true,
    confirmationText = undefined,
    confirmationInstruction = undefined,
  }: ConfirmDialogProps
) => {
  const t = useTranslations("common");
  const [typedText, setTypedText] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const confirmationMissing = confirmationText !== undefined && typedText !== confirmationText;

  const reset = () => {
    setTypedText("");
    setHasFailed(false);
  };

  const handleConfirm = async () => {
    setIsBusy(true);
    setHasFailed(false);
    try {
      await onConfirm();
      closeModal(id);
    } catch {
      setHasFailed(true);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Modal id={id} title={title} size={"sm"} onClose={reset}>
      <div className="flex flex-col gap-4">
        <p className="text-base-content/80">{message}</p>
        {confirmationText !== undefined &&
            <label className="flex flex-col gap-2 text-sm">
              {confirmationInstruction}
                <InputText placeholder={confirmationText} value={typedText} onChange={setTypedText}/>
            </label>
        }
        {hasFailed &&
            <p role="alert" className="text-sm text-error">{errorMessage}</p>
        }
        <div className="flex flex-row justify-end gap-2">
          <Button primary={false} disabled={isBusy} clickAction={() => closeModal(id)}>
            {t("cancel")}
          </Button>
          <Button danger={danger} disabled={isBusy || confirmationMissing} clickAction={handleConfirm}>
            {isBusy && <span className="loading loading-spinner loading-xs"/>}
            {isBusy && busyLabel ? busyLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
