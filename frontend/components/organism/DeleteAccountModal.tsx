import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";
import InputText from "../atoms/InputText";
import {useState} from "react";
import {useTranslations} from "next-intl";
import Box from "../atoms/Box";

export const DeleteAccountModalId = "delete-account-modal";

type DeleteAccountModalProps = {
  userEmail: string;
  onDeleteAccount: () => void;
}

const DeleteAccountModal = (props: DeleteAccountModalProps) => {
  const t = useTranslations("common");
  const [inputValue, setInputValue] = useState("");

  const buttonDisabled = inputValue !== props.userEmail;

  const handleCancel = () => {
    setInputValue("");
    closeModal(DeleteAccountModalId);
  };

  return (
    <Modal id={DeleteAccountModalId} onClose={handleCancel}>
      <h1 className="font-bold text-xl w-full text-center">{t("delete_account_title")}</h1>
      <Box>
        <FlexColumn position={"center"}>
          <p className="text-center mb-2">{t("delete_account_warning")}</p>
          <p className="text-center mb-4">{t("delete_account_instruction")}</p>
          <InputText placeholder="Email" value={inputValue} onChange={(value) => setInputValue(value)}/>
          <FlexRow position={"center"}>
            <Button clickAction={handleCancel} primary={true}>
              <span>{t("cancel")}</span>
            </Button>
            <Button disabled={buttonDisabled} clickAction={async () => {
              props.onDeleteAccount();
              closeModal(DeleteAccountModalId);
            }} primary={false}>
              <span>{t("delete")}</span>
            </Button>
          </FlexRow>
        </FlexColumn>
      </Box>
    </Modal>
  )
}

export default DeleteAccountModal;
