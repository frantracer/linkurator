import {ChatScope} from '../entities/Chat';
import {ChatScopeEntity, getScopeEntities} from '../utilities/chatScope';
import useProfile from './useProfile';
import {useTopics} from './useTopics';
import useSubscriptions from './useSubscriptions';
import {useCurators} from './useCurators';

export type NamedScopeEntity = ChatScopeEntity & {
  // Unknown for entities outside of the user's library.
  name?: string;
};

// The entities of a scope with the names the user knows them by.
const useScopeEntities = (scope: ChatScope | undefined): NamedScopeEntity[] => {
  const {profile, profileIsLoading} = useProfile();
  const {topics} = useTopics(profile, profileIsLoading);
  const {subscriptions} = useSubscriptions(profile);
  const {curators} = useCurators(profile, profileIsLoading);

  const getName = (entity: ChatScopeEntity): string | undefined => {
    switch (entity.kind) {
      case 'topic':
        return topics.find((topic) => topic.uuid === entity.id)?.name;
      case 'subscription':
        return subscriptions.find((subscription) => subscription.uuid === entity.id)?.name;
      case 'curator':
        return curators.find((curator) => curator.id === entity.id)?.username;
    }
  };

  return getScopeEntities(scope).map((entity) => ({...entity, name: getName(entity)}));
};

export default useScopeEntities;
