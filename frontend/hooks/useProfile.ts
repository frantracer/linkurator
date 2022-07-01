import axios from "axios";
import {useEffect, useState} from "react";
import configuration from "../configuration";

export interface ProfileResponse {
  first_name: string
  last_name: string
  avatar_url: string
}

export type Profile =
  | undefined
  | ProfileResponse;

const useProfile = () => {
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const {data} = await axios.get<ProfileResponse>(configuration.PROFILE_URL, {withCredentials: true});
        setProfile(data);
      } catch (error: any) {
        console.error("Error retrieving profile", error);
      }
    };

    fetchProfile();
  }, []);

  return profile;
};

export default useProfile;
