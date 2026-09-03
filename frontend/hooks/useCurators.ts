import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useCallback} from 'react';
import {Curator} from '../entities/Curators';
import {getCurators} from '../services/curatorService';
import {Profile} from "../services/profileService";

type UseCurators = {
  curators: Curator[];
  curatorsAreLoading: boolean;
  refreshCurators: () => void;
}

const fetchCurators = async (profile: Profile | null | undefined) => {
  if (profile) {
    return await getCurators();
  }
  return [];
};

export function useCurators(profile: Profile | null | undefined, profileIsLoading: boolean): UseCurators {
  const queryClient = useQueryClient();
  const {data: curators = [], isLoading, refetch} = useQuery({
    queryKey: ['curators', profile, profileIsLoading],
    queryFn: () => fetchCurators(profile),
    staleTime: 60000,
  });

  const curatorsAreLoading = profileIsLoading || isLoading;

  const refreshCurators = useCallback(() => {
    queryClient.invalidateQueries({queryKey: ['latestFollowedCuratorItems']});
    refetch();
  }, [queryClient, refetch]);

  return {
    curators,
    curatorsAreLoading,
    refreshCurators,
  };
}
