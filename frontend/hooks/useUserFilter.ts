import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {deleteUserFilter, getUserFilter, upsertUserFilter} from "../services/userFilterService";
import {defaultFilters, Filters} from "../entities/Filters";

const fetchUserFilter = async () => {
  return await getUserFilter() || defaultFilters;
};

const useUserFilter = () => {
  const queryClient = useQueryClient();

  const {data: userFilter, isLoading, error, refetch} = useQuery({
    queryKey: ['userFilter'],
    queryFn: fetchUserFilter,
    staleTime: 60000,
    initialData: defaultFilters,
    refetchOnMount: 'always',
  });

  const upsertMutation = useMutation({
    mutationFn: (request: Filters) => upsertUserFilter(request),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['userFilter']});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUserFilter(),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['userFilter']});
    },
  });

  if (error) {
    console.error("Error retrieving user filter", error);
  }

  return {
    userFilter,
    isLoading: isLoading || upsertMutation.isLoading || deleteMutation.isLoading,
    refreshUserFilter: refetch,
    upsertUserFilter: upsertMutation.mutate,
    deleteUserFilter: deleteMutation.mutate,
  };
};

export default useUserFilter;
