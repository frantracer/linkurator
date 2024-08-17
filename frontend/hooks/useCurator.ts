import {useQuery} from '@tanstack/react-query';
import {getCurator} from "../services/curatorService";
import {Curator} from "../entities/Curators";

export const useCurator = (username: string, curators: Curator[]) => {
  const {data, isLoading, error} = useQuery({
    queryKey: ['curator', username, curators],
    queryFn: async () => {
      if (curators.length > 0) {
        const foundCurator = curators.find((curator) => curator.username === username);
        if (foundCurator) {
          return foundCurator
        }
      }
      return await getCurator(username)
    },
    staleTime: 60000,
  });

  return {
    curator: data === undefined ? null : data,
    curatorIsLoading: isLoading,
    curatorIsError: error
  };
}
