import {useQuery} from "@tanstack/react-query";
import {emptyCuratorSuggestions} from "../entities/CuratorSuggestions";
import {getCuratorSuggestions} from "../services/curatorService";

export const useCuratorSuggestions = (curatorId: string | null, isEnabled: boolean) => {
  const {data, isLoading, isError, refetch} = useQuery({
    queryKey: ['curator', curatorId, 'suggestions'],
    queryFn: () => getCuratorSuggestions(curatorId),
    enabled: isEnabled && curatorId !== null,
    staleTime: 60000,
  })

  return {
    suggestions: data === undefined ? emptyCuratorSuggestions : data,
    suggestionsIsLoading: isLoading,
    suggestionsIsError: isError && data === undefined,
    refetchSuggestions: refetch,
  };
}
