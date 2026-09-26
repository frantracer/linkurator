import React from 'react';
import {paths} from '../../configuration';
import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import EntityPickerModal, {PickedEntity} from './EntityPickerModal';

export const QuickAccessesModalId = 'quick-accesses-modal';

interface QuickAccessesModalProps {
  onClose?: () => void;
}

const QuickAccessesModal: React.FC<QuickAccessesModalProps> = ({onClose}) => {
  const t = useTranslations('common');
  const router = useRouter();

  const handleSelect = (entity: PickedEntity) => {
    switch (entity.kind) {
      case 'topic':
        router.push(`${paths.TOPICS}/${entity.topic.uuid}`);
        break;
      case 'subscription':
        router.push(`${paths.SUBSCRIPTIONS}/${entity.subscription.uuid}`);
        break;
      case 'curator':
        router.push(`${paths.CURATORS}/${entity.curator.username}`);
        break;
    }
  };

  return (
    <EntityPickerModal
      id={QuickAccessesModalId}
      title={t('quick_accesses')}
      onSelect={handleSelect}
      onClose={onClose}
    />
  );
};

export default QuickAccessesModal;
