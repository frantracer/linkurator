import {configuration} from "../configuration";
import axios from "axios";

export enum InteractionType {
  Recommended = "recommended",
  Discouraged = "discouraged",
  Viewed = "viewed",
  Hidden = "hidden",
}

export async function interactWithItem(uuid: string, interactionType: InteractionType) {
  const {data, status} = await axios.post(
    configuration.ITEMS_URL + uuid + "/interactions/" + interactionType, {}, {withCredentials: true});
  if (status === 201) {
    return data;
  } else {
    console.error("Error marking item as recommend", data);
  }
}

export async function removeInteractionWithItem(uuid: string, interactionType: InteractionType) {
  const {data, status} = await axios.delete(
    configuration.ITEMS_URL + uuid + "/interactions/" + interactionType, {withCredentials: true});
  if (status === 204) {
    return data;
  } else {
    console.error("Error marking item as recommend", data);
  }
}
