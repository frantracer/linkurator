import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";
import InputText from "../atoms/InputText";
import {useState} from "react";
import { useTranslations } from "next-intl";

export const DeleteAccountModalId = "delete-account-modal";

type DeleteAccountModalProps = {
  userEmail: string;
  onDeleteAccount: () => void;
}

const DeleteAccountModal = (props: DeleteAccountModalProps) => {
  const t = useTranslations("common");
  const [inputValue, setInputValue] = useState("");

  const buttonDisabled = inputValue !== props.userEmail;

  return (
    <Modal id={DeleteAccountModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t("delete_account_title")}</h1>
        <p className="text-center">{t("delete_account_warning")}</p>
        <p className="text-center">{t("delete_account_instruction")}</p>
        <InputText placeholder="Email" value={inputValue} onChange={(value) => setInputValue(value)}/>
        <FlexRow position={"end"}>
          <Button clickAction={() => closeModal(DeleteAccountModalId)}>
            <span>{t("cancel")}</span>
          </Button>
          <Button disabled={buttonDisabled} clickAction={async () => {
            props.onDeleteAccount();
            closeModal(DeleteAccountModalId);
          }}>
            <span>{t("delete")}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default DeleteAccountModal;
