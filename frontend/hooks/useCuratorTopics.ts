import {getCuratorTopics} from "../services/curatorService";
import {useQuery} from "@tanstack/react-query";

export const useCuratorTopics = (curatorId: string | null) => {
  const {data, isLoading, error, refetch} = useQuery({
    queryKey: ['curator', curatorId, 'topics'],
    queryFn: async () => await getCuratorTopics(curatorId),
    staleTime: 60000,
  })

  return {
    topics: data === undefined ? [] : data,
    topicsIsLoading: isLoading,
    topicsIsError: error,
    refetchTopics: refetch,
  };
}
