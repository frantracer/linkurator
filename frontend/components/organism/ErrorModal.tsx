import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";

export const ErrorModalId = "error-modal";

type ErrorModalProps = {
  title: string;
  message: string;
}

const ErrorModal = (props: ErrorModalProps) => {
  return (
    <Modal id={ErrorModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center text-error">{props.title}</h1>
        <p className="text-center mb-4">
          {props.message}
        </p>
        <FlexRow position={"center"}>
          <Button 
            clickAction={() => closeModal(ErrorModalId)}
            primary={true}
          >
            <span>OK</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default ErrorModal;