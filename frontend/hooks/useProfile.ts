import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { configuration } from '../configuration';

export type Profile = {
  first_name: string
  last_name: string
  avatar_url: string
}

const fetchProfile = async () => {
  const { data } = await axios.get<Profile | undefined>(configuration.PROFILE_URL, { withCredentials: true });
  return {
    first_name: data?.first_name || '',
    last_name: data?.last_name || '',
    avatar_url: data?.avatar_url || ''
  };
};

const useProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 60000,
  });

  if (error) {
    console.error("Error retrieving profile", error);
  }

  return { profile, profileIsLoading: isLoading };
};

export default useProfile;
