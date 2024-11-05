import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";

export const DeleteTopicConfirmationModalId = "delete-topic-confirmation-modal";

type DeleteTopicConfirmationModalProps = {
  onDeleteTopic: () => void;
}

const DeleteTopicConfirmationModal = (props: DeleteTopicConfirmationModalProps) => {
  return (
    <Modal id={DeleteTopicConfirmationModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">¿Quieres borrar esta categoría?</h1>
        <FlexRow position={"end"}>
          <Button clickAction={() => closeModal(DeleteTopicConfirmationModalId)}>
            <span>Cancelar</span>
          </Button>
          <Button clickAction={async () => {
            props.onDeleteTopic();
            closeModal(DeleteTopicConfirmationModalId);
          }}>
            <span>Borrar</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default DeleteTopicConfirmationModal;
