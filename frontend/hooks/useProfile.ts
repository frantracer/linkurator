import axios from "axios";
import {useEffect, useState} from "react";
import {configuration} from "../configuration";

export interface ProfileResponse {
  first_name: string
  last_name: string
  avatar_url: string
  is_logged_in: boolean | undefined
}

export type Profile =
  | undefined
  | ProfileResponse;

const useProfile = () => {
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let {data} = await axios.get<ProfileResponse>(configuration.PROFILE_URL, {withCredentials: true});
        data.is_logged_in = true;
        setProfile(data);
      } catch (error: any) {
        console.error("Error retrieving profile", error);
        setProfile({is_logged_in: false, first_name: "", last_name: "", avatar_url: ""});
      }
    };

    fetchProfile();
  }, []);

  return profile;
};

export default useProfile;
