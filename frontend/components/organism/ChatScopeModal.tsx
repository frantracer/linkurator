import React from 'react';
import {useTranslations} from 'next-intl';
import Button from '../atoms/Button';
import {CheckIcon, CrossIcon} from '../atoms/Icons';
import FlexRow from '../atoms/FlexRow';
import FlexItem from '../atoms/FlexItem';
import EntityPickerModal, {PickedEntity} from './EntityPickerModal';
import {ChatScope} from '../../entities/Chat';
import {getScopeEntities} from '../../utilities/chatScope';
import {closeModal} from '../../utilities/modalAction';

export const ChatScopeModalId = 'chat-scope-modal';

type ChatScopeModalProps = {
  scope?: ChatScope;
  onToggleEntity: (entity: PickedEntity) => void;
  onClearScope: () => void;
};

// Same picker as the quick accesses, but choosing entries builds the chat scope.
const ChatScopeModal = ({scope, onToggleEntity, onClearScope}: ChatScopeModalProps) => {
  const t = useTranslations('common');
  const selected = getScopeEntities(scope);

  return (
    <EntityPickerModal
      id={ChatScopeModalId}
      title={t('chat_scope')}
      selected={selected}
      multiple={true}
      onSelect={onToggleEntity}
      onClose={() => closeModal(ChatScopeModalId)}
      footer={(close) => (
        <FlexRow>
          {selected.length > 0 &&
              <FlexItem grow={true}>
                  <Button primary={false} fitContent={false} clickAction={onClearScope}>
                      <CrossIcon/>
                    {t('chat_scope_remove')}
                  </Button>
              </FlexItem>
          }
          <FlexItem grow={true}>
            <Button fitContent={false} clickAction={close}>
              <CheckIcon/>
              {t('accept')}
            </Button>
          </FlexItem>
        </FlexRow>
      )}
    />
  );
};

export default ChatScopeModal;
