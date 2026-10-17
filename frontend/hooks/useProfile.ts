import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {getProfile, PersonalDataChanges, updatePersonalData, updateUsername} from "../services/profileService";


const fetchProfile = async () => {
  return await getProfile();
};

const useProfile = () => {
  const queryClient = useQueryClient();

  const {data: profile, isLoading, error, refetch} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60000,
  });

  const updatePersonalDataMutation = useMutation({
    mutationFn: (changes: PersonalDataChanges) => updatePersonalData(changes),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['profile']});
    },
  });

  const updateUsernameMutation = useMutation({
    mutationFn: (username: string) => updateUsername(username),
    onSuccess: (result) => {
      if (result === "updated") {
        queryClient.invalidateQueries({queryKey: ['profile']});
      }
    },
  });

  if (error) {
    console.error("Error retrieving profile", error);
  }

  return {
    profile,
    profileIsLoading: isLoading,
    refreshProfile: refetch,
    updatePersonalData: updatePersonalDataMutation.mutate,
    isSavingPersonalData: updatePersonalDataMutation.isPending,
    updateUsername: updateUsernameMutation.mutate,
    isSavingUsername: updateUsernameMutation.isPending,
  };
};

export default useProfile;
