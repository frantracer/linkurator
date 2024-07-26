import {configuration} from "../configuration";
import axios from "axios";

export type Profile = {
  first_name: string
  last_name: string
  username: string
  avatar_url: string
  email: string
}

export async function getProfile(): Promise<Profile | undefined> {
  try {
    const {data, status} = await axios.get<Profile>(configuration.PROFILE_URL, {withCredentials: true});
    if (status === 200) {
      return data
    } else {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
}

export async function deleteProfile(): Promise<void> {
  const {status} = await axios.delete(configuration.PROFILE_URL, {withCredentials: true});
  if (status !== 204) {
    throw new Error("Error deleting profile");
  }
}
