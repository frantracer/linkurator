import axios from "axios";
import {useEffect, useState} from "react";
import {configuration} from "../configuration";

export type Profile = {
  first_name: string
  last_name: string
  avatar_url: string
}

export type ProfileState = {
  profile: Profile | undefined;
  isLoading: boolean;
}

const useProfile = () => {
  const [profileState, setProfileState] = useState<ProfileState>({profile: undefined, isLoading: true});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {data} = await axios.get<Profile | undefined>(configuration.PROFILE_URL, {withCredentials: true});
        setProfileState({profile: data, isLoading: false});
      } catch (error: any) {
        console.error("Error retrieving profile", error);
        setProfileState({profile: undefined, isLoading: false});
      }
    };

    fetchProfile().then(() => {});
  }, []);

  return {profile: profileState.profile, profileIsLoading: profileState.isLoading};
};

export default useProfile;
