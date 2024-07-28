import {useQuery} from '@tanstack/react-query';
import {getCurator} from "../services/curatorService";

export const useCurator = (username: string) => {
  const {data, isLoading, error} = useQuery({
    queryKey: ['curator', username],
    queryFn: async () => await getCurator(username),
    staleTime: 60000,
  });

  return {
    curator: data === undefined ? null : data,
    curatorIsLoading: isLoading,
    curatorIsError: error
  };
}
