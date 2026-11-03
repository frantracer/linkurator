import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";
import {useTranslations} from 'next-intl';

export const ErrorModalId = "error-modal";

type ErrorModalProps = {
  title: string;
  message: string;
}

const ErrorModal = (props: ErrorModalProps) => {
  const t = useTranslations('common');
  
  return (
    <Modal id={ErrorModalId} title={props.title} danger={true}>
      <FlexColumn>
        <p className="text-center mb-4">
          {props.message}
        </p>
        <FlexRow position={"center"}>
          <Button 
            clickAction={() => closeModal(ErrorModalId)}
            primary={true}
          >
            <span>{t('ok')}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default ErrorModal;