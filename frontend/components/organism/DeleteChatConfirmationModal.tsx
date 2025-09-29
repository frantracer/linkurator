import Modal from "../atoms/Modal";
import FlexColumn from "../atoms/FlexColumn";
import FlexRow from "../atoms/FlexRow";
import Button from "../atoms/Button";
import {closeModal} from "../../utilities/modalAction";
import {useTranslations} from 'next-intl';

export const DeleteChatConfirmationModalId = "delete-chat-confirmation-modal";

type DeleteChatConfirmationModalProps = {
  onDeleteChat: () => void;
  isDeleting: boolean;
}

const DeleteChatConfirmationModal = (props: DeleteChatConfirmationModalProps) => {
  const t = useTranslations('common');
  
  return (
    <Modal id={DeleteChatConfirmationModalId}>
      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t('delete_conversation')}</h1>
        <p className="text-center mb-4">
          {t('delete_conversation_confirmation')}
        </p>
        <FlexRow position={"center"}>
          <Button
            clickAction={async () => {
              props.onDeleteChat();
            }}
            disabled={props.isDeleting}
            primary={false}
          >
            <span>{props.isDeleting ? t('deleting') : t('delete')}</span>
          </Button>
          <Button
            clickAction={() => closeModal(DeleteChatConfirmationModalId)}
            disabled={props.isDeleting}
            primary={true}
          >
            <span>{t('cancel')}</span>
          </Button>
        </FlexRow>
      </FlexColumn>
    </Modal>
  )
}

export default DeleteChatConfirmationModal;