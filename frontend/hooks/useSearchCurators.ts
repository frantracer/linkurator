import {useQuery} from '@tanstack/react-query';
import {Curator} from '../entities/Curators';
import {searchCurators} from '../services/curatorService';

type UseSearchCurators = {
  curators: Curator[];
  curatorsAreLoading: boolean;
  refreshCurators: () => void;
}

export function useSearchCurators(username: string): UseSearchCurators {
  const {data: curators = [], isLoading: curatorsAreLoading, refetch: refreshCurators} = useQuery({
    queryKey: ['searchCurators', username],
    queryFn: () => searchCurators(username),
    staleTime: 60000,
  });

  return {
    curators,
    curatorsAreLoading,
    refreshCurators,
  };
}