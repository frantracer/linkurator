import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";
import InputText from "../atoms/InputText";
import {useState} from "react";

export const DeleteAccountModalId = "delete-account-modal";

type DeleteAccountModalProps = {
  userEmail: string;
  onDeleteAccount: () => void;
}

const DeleteAccountModal = (props: DeleteAccountModalProps) => {
  const [inputValue, setInputValue] = useState("");

  const buttonDisabled = inputValue !== props.userEmail;

  return (
    <Modal id={DeleteAccountModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">Delete account</h1>
        <p className="text-center">All your data will be lost, are you sure you want to delete your account?</p>
        <p className="text-center">Write your email if you want to continue</p>
        <InputText placeholder="Email" value={inputValue} onChange={(value) => setInputValue(value)}/>
        <FlexRow position={"end"}>
          <Button clickAction={() => closeModal(DeleteAccountModalId)}>
            <span>Cancel</span>
          </Button>
          <Button disabled={buttonDisabled} clickAction={async () => {
            props.onDeleteAccount();
            closeModal(DeleteAccountModalId);
          }}>
            <span>Delete</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default DeleteAccountModal;
