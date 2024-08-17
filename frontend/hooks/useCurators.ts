import {useQuery} from '@tanstack/react-query';
import {Curator} from '../entities/Curators';
import {getCurators} from '../services/curatorService';
import {Profile} from "../services/profileService";

type UseCurators = {
  curators: Curator[];
  curatorsAreLoading: boolean;
  refreshCurators: () => void;
}

const fetchCurators = async (profile: Profile | undefined) => {
  if (profile) {
    return await getCurators();
  }
  return [];
};

export function useCurators(profile: Profile | undefined, profileIsLoading: boolean): UseCurators {
  const {data: curators = [], isLoading, refetch: refreshCurators} = useQuery({
    queryKey: ['curators', profile, profileIsLoading],
    queryFn: () => fetchCurators(profile),
    staleTime: 60000,
  });

  const curatorsAreLoading = profileIsLoading || isLoading;

  return {
    curators,
    curatorsAreLoading,
    refreshCurators,
  };
}
