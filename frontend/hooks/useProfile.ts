import {useQuery} from '@tanstack/react-query';
import {getProfile} from "../services/profileService";


const fetchProfile = async () => {
  return await getProfile();
};

const useProfile = () => {
  const {data: profile, isLoading, error, refetch} = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60000,
  });

  if (error) {
    console.error("Error retrieving profile", error);
  }

  return {profile, profileIsLoading: isLoading, refreshProfile: refetch};
};

export default useProfile;
