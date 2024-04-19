import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { configuration } from '../configuration';

export type Profile = {
  first_name: string
  last_name: string
  avatar_url: string
  email: string
}

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookie = parts.pop();
    if (!cookie) {
      return undefined;
    }
    return cookie.split(';').shift();
  }
  return undefined;
}

const fetchProfile = async () => {
  const token = getCookie('token');
  if (!token) {
    return undefined;
  }

  try {
    const { data } = await axios.get<Profile | undefined>(configuration.PROFILE_URL, { withCredentials: true });
    return {
      first_name: data?.first_name || '',
      last_name: data?.last_name || '',
      avatar_url: data?.avatar_url || '',
      email: data?.email || '',
    };
  } catch (error) {
    console.error("Error retrieving profile", error);
    return undefined;
  }
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
