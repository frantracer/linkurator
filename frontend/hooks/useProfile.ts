import axios from "axios";
import { useEffect, useState } from "react";
import configuration from "../configuration";

export type Profile =
  | undefined
  | {
      firstName: string;
      lastName: string;
      avatar: string;
    };

const useProfile = () => {
  const [profile, setProfile] = useState<Profile>();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios(configuration.PROFILE_URL);
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
