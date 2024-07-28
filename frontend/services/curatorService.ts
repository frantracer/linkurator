import {Curator} from "../entities/Curators";
import axios from "axios";
import {configuration} from "../configuration";
import {Topic} from "../entities/Topic";

export async function getCurator(username: string | null): Promise<Curator | null> {
  if (username === null || username === "") {
    return null;
  }

  try {
    const {
      data,
      status
    } = await axios.get<Curator>(configuration.CURATORS_URL + "username/" + username, {withCredentials: true});

    if (status === 200) {
      return data
    } else {
      console.error("Error retrieving curator", data);
      return null;
    }
  } catch (error) {
    console.error("Error retrieving curator", error);
    return null;
  }
}

export async function getCuratorTopics(curatorId: string | null): Promise<Topic[]> {
  if (curatorId === null) {
    return [];
  }

  const {
    data,
    status
  } = await axios.get<Topic[]>(configuration.CURATORS_URL + curatorId + "/topics", {withCredentials: true});
  if (status === 200) {
    return data
  } else {
    console.error("Error retrieving curator topics", data);
    return [];
  }
}
