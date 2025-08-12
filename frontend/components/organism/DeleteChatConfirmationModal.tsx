import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";

export const DeleteChatConfirmationModalId = "delete-chat-confirmation-modal";

type DeleteChatConfirmationModalProps = {
  onDeleteChat: () => void;
  isDeleting: boolean;
}

const DeleteChatConfirmationModal = (props: DeleteChatConfirmationModalProps) => {
  return (
    <Modal id={DeleteChatConfirmationModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">Delete Conversation</h1>
        <p className="text-center mb-4">
          Are you sure you want to delete this conversation? This action cannot be undone.
        </p>
        <FlexRow position={"end"}>
          <Button 
            clickAction={() => closeModal(DeleteChatConfirmationModalId)}
            disabled={props.isDeleting}
            primary={false}
          >
            <span>Cancel</span>
          </Button>
          <Button 
            clickAction={async () => {
              props.onDeleteChat();
            }}
            disabled={props.isDeleting}
            primary={true}
          >
            <span>{props.isDeleting ? 'Deleting...' : 'Delete'}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default DeleteChatConfirmationModal;