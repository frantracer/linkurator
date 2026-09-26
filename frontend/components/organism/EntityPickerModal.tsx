import React, {useState} from 'react';
import Modal from '../atoms/Modal';
import Box from '../atoms/Box';
import Menu from '../atoms/Menu';
import {MenuItem} from '../atoms/MenuItem';
import FlexColumn from '../atoms/FlexColumn';
import FlexRow from '../atoms/FlexRow';
import Miniature from '../atoms/Miniature';
import SearchBar from '../molecules/SearchBar';
import useProfile from '../../hooks/useProfile';
import {useTopics} from '../../hooks/useTopics';
import useSubscriptions from '../../hooks/useSubscriptions';
import {useCurators} from '../../hooks/useCurators';
import {useDebounce} from '../../hooks/useDebounce';
import {Topic} from '../../entities/Topic';
import {Subscription} from '../../entities/Subscription';
import {Curator} from '../../entities/Curators';
import {useTranslations} from 'next-intl';
import {getProviderIcon} from '../../entities/Provider';
import useProviders from '../../hooks/useProviders';
import {InfoBanner} from '../atoms/InfoBanner';

export type PickedEntity =
  | { kind: 'topic', topic: Topic }
  | { kind: 'subscription', subscription: Subscription }
  | { kind: 'curator', curator: Curator };

type EntityPickerModalProps = {
  id: string;
  title: string;
  onSelect: (entity: PickedEntity) => void;
  onClose?: () => void;
  selected?: { kind: PickedEntity['kind'], id: string }[];
  // Picking keeps the modal open, so several entries can be picked in a row.
  multiple?: boolean;
  children?: React.ReactNode;
  // Shown below the list, given a way to close the modal that also clears the search.
  footer?: (close: () => void) => React.ReactNode;
};

// Searchable list of the user's topics, subscriptions and curators; picking one is up to the caller.
const EntityPickerModal = ({id, title, onSelect, onClose, selected = [], multiple = false, children, footer}: EntityPickerModalProps) => {
  const t = useTranslations('common');
  const {profile, profileIsLoading} = useProfile();
  const {topics} = useTopics(profile, profileIsLoading);
  const {subscriptions} = useSubscriptions(profile);
  const {curators} = useCurators(profile, profileIsLoading);
  const {providers} = useProviders();

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const normalizedSearch = debouncedSearch.toLowerCase();
  const matchesSearch = (name: string) => name.toLowerCase().includes(normalizedSearch);
  const filteredTopics = topics.filter((topic) => matchesSearch(topic.name));
  const filteredSubscriptions = subscriptions.filter((sub) => matchesSearch(sub.name));
  const filteredCurators = curators.filter((curator) => matchesSearch(curator.username));

  const isSelected = (kind: PickedEntity['kind'], entityId: string) =>
    selected.some((entity) => entity.kind === kind && entity.id === entityId);

  const handleSelect = (entity: PickedEntity) => {
    onSelect(entity);
    if (multiple) return;
    setSearchValue('');
    onClose?.();
  };

  const handleClose = () => {
    setSearchValue('');
    onClose?.();
  };

  return (
    <Modal id={id} onClose={handleClose}>

      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{title}</h1>
        <SearchBar
          placeholder={t('search_topics_subscriptions_curators')}
          value={searchValue}
          handleChange={setSearchValue}
          autofocus={true}
        />
        {children}
        <div className={"h-96 w-full overflow-y-auto p-2"}>
          {filteredTopics.length === 0 && filteredSubscriptions.length === 0 && filteredCurators.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              {debouncedSearch !== '' ? (
                <InfoBanner>{t('no_search_results')}</InfoBanner>
              ) : (
                <InfoBanner>
                  <div className="text-center">
                    <p className="font-medium">{t('search_nothing_here')}</p>
                    <p className="text-sm mt-1">{t('search_follow_first')}</p>
                  </div>
                </InfoBanner>
              )}
            </div>
          ) : (
            <FlexColumn>
              <>
                {filteredTopics.length > 0 &&
                    <Box title={`${t('topics')} (${filteredTopics.length})`}>
                        <div className={"max-h-60 overflow-y-auto"}>
                            <Menu>
                              {filteredTopics.map((topic: Topic) => (
                                <MenuItem key={topic.uuid}
                                          selected={isSelected('topic', topic.uuid)}
                                          onClick={() => handleSelect({kind: 'topic', topic})}>
                                  <FlexRow position="start">
                                    <Miniature src={topic.curator.avatar_url} alt={topic.curator.username}/>
                                    <span>{topic.name}</span>
                                  </FlexRow>
                                </MenuItem>
                              ))}
                            </Menu>
                        </div>
                    </Box>
                }
                {filteredSubscriptions.length > 0 &&
                    <Box title={`${t('subscriptions')} (${filteredSubscriptions.length})`}>
                        <div className={"max-h-60 overflow-y-auto"}>
                            <Menu>
                              {filteredSubscriptions.map((sub: Subscription) => (
                                <MenuItem key={sub.uuid}
                                          selected={isSelected('subscription', sub.uuid)}
                                          onClick={() => handleSelect({kind: 'subscription', subscription: sub})}>
                                  <FlexRow position="start">
                                    <Miniature
                                      src={sub.thumbnail}
                                      alt={sub.name}
                                      badgeImage={getProviderIcon(providers, sub.provider)}
                                    />
                                    <span>{sub.name}</span>
                                  </FlexRow>
                                </MenuItem>
                              ))}
                            </Menu>

                        </div>
                    </Box>
                }
                {filteredCurators.length > 0 &&
                    <Box title={`${t('curators')} (${filteredCurators.length})`}>
                        <div className={"max-h-60 overflow-y-auto"}>
                            <Menu>
                              {filteredCurators.map((curator: Curator) => (
                                <MenuItem key={curator.id}
                                          selected={isSelected('curator', curator.id)}
                                          onClick={() => handleSelect({kind: 'curator', curator})}>
                                  <FlexRow position="start">
                                    <Miniature src={curator.avatar_url} alt={curator.username}/>
                                    <span>{curator.username}</span>
                                  </FlexRow>
                                </MenuItem>
                              ))}
                            </Menu>
                        </div>
                    </Box>
                }
              </>
            </FlexColumn>
          )}
        </div>
        {footer?.(handleClose)}
      </FlexColumn>
    </Modal>
  );
};

export default EntityPickerModal;
