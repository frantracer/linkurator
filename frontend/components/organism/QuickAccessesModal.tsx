import React, { useState } from 'react';
import Modal from '../atoms/Modal';
import Box from '../atoms/Box';
import Menu from '../atoms/Menu';
import { MenuItem } from '../atoms/MenuItem';
import FlexColumn from '../atoms/FlexColumn';
import FlexRow from '../atoms/FlexRow';
import Miniature from '../atoms/Miniature';
import SearchBar from '../molecules/SearchBar';
import useProfile from '../../hooks/useProfile';
import { useTopics } from '../../hooks/useTopics';
import useSubscriptions from '../../hooks/useSubscriptions';
import { useCurators } from '../../hooks/useCurators';
import { useDebounce } from '../../hooks/useDebounce';
import { Topic } from '../../entities/Topic';
import { Subscription } from '../../entities/Subscription';
import { Curator } from '../../entities/Curators';
import { paths } from '../../configuration';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { providerIconUrl } from '../../entities/Subscription';

export const QuickAccessesModalId = 'quick-accesses-modal';

interface QuickAccessesModalProps {
  onClose?: () => void;
}

const QuickAccessesModal: React.FC<QuickAccessesModalProps> = ({ onClose }) => {
  const t = useTranslations('common');
  const router = useRouter();
  const { profile, profileIsLoading } = useProfile();
  const { topics } = useTopics(profile, profileIsLoading);
  const { subscriptions } = useSubscriptions(profile);
  const { curators } = useCurators(profile, profileIsLoading);

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 300);

  const filteredTopics = debouncedSearch === ''
    ? (topics || [])
    : (topics || []).filter((t: any) => t.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const filteredSubscriptions = debouncedSearch === ''
    ? (subscriptions || [])
    : (subscriptions || []).filter((s: any) => s.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
  const filteredCurators = debouncedSearch === ''
    ? (curators || [])
    : (curators || []).filter((c: any) => c.username.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose?.();
  };

  return (
    <Modal id={QuickAccessesModalId} onClose={onClose}>

      <FlexColumn>
        <h1 className="font-bold text-xl w-full text-center">{t('quick_accesses')}</h1>
        <SearchBar
          placeholder={t('search_topics_subscriptions_curators')}
          value={searchValue}
          handleChange={setSearchValue}
          autofocus={true}
        />
        <div className={"h-96 w-full overflow-y-auto p-1"}>
          <FlexColumn>
            {filteredTopics.length === 0 && filteredSubscriptions.length === 0 && filteredCurators.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center text-gray-500">
                {debouncedSearch !== '' ? (
                  <p>{t('no_search_results')}</p>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">{t('search_nothing_here')}</p>
                    <p className="text-sm mt-1">{t('search_follow_first')}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {filteredTopics.length > 0 &&
                    <Box title={`${t('topics')} (${filteredTopics.length})`}>
                        <div className={"max-h-60 overflow-y-auto"}>
                            <Menu>
                              {filteredTopics.map((topic: Topic) => (
                                <MenuItem key={topic.uuid} onClick={() => handleNavigate(`${paths.TOPICS}/${topic.uuid}`)}>
                                  <FlexRow position="start">
                                    <Miniature src={topic.curator.avatar_url} alt={topic.curator.username} />
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
                                <MenuItem key={sub.uuid} onClick={() => handleNavigate(`${paths.SUBSCRIPTIONS}/${sub.uuid}`)}>
                                  <FlexRow position="start">
                                    <Miniature
                                      src={sub.thumbnail}
                                      alt={sub.name}
                                      badgeImage={providerIconUrl(sub.provider)}
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
                                <MenuItem key={curator.id} onClick={() => handleNavigate(`${paths.CURATORS}/${curator.username}`)}>
                                  <FlexRow position="start">
                                    <Miniature src={curator.avatar_url} alt={curator.username} />
                                    <span>{curator.username}</span>
                                  </FlexRow>
                                </MenuItem>
                              ))}
                            </Menu>
                        </div>
                    </Box>
                }
              </>
            )}
          </FlexColumn>
        </div>
      </FlexColumn>
    </Modal>
  );
};

export default QuickAccessesModal;