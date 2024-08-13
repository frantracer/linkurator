import {Curator} from "../entities/Curators";
import axios from "axios";
import {configuration} from "../configuration";
import {Topic} from "../entities/Topic";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";

export type CuratorItemsResponse = {
  elements: SubscriptionItem[];
  nextPage: URL | undefined;
}

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

export async function getCuratorItems(curatorId: string | null): Promise<CuratorItemsResponse> {
  if (curatorId === null) {
    return {elements: [], nextPage: undefined};
  }

  const {
    data,
    status
  } = await axios.get<CuratorItemsResponse>(configuration.CURATORS_URL + curatorId + "/items", {withCredentials: true});
  if (status === 200) {
    const response = mapJsonToCuratorItemsResponse(data);
    return {elements: response.elements, nextPage: response.nextPage};
  } else {
    console.error("Error retrieving curator items", data);
    return {elements: [], nextPage: undefined};
  }
}

export async function getCuratorItemsFromUrl(url: URL): Promise<CuratorItemsResponse> {
  const {
    data,
    status
  } = await axios.get<CuratorItemsResponse>(url.toString(), {withCredentials: true});
  if (status === 200) {
    const response = mapJsonToCuratorItemsResponse(data);
    return {elements: response.elements, nextPage: response.nextPage};
  } else {
    console.error("Error retrieving curator items", data);
    return {elements: [], nextPage: undefined};
  }
}

const mapJsonToCuratorItemsResponse = (json: Record<string, any>): CuratorItemsResponse => {
  let nextPage: URL | undefined = undefined;
  if (json.next_page) {
    nextPage = replaceBaseUrl(new URL(json.next_page), new URL(configuration.API_BASE_URL));
  }

  return {
    elements: json.elements.map((element: Record<string, any>) => {
      const published_at = new Date(element.published_at);
      if (isNaN(published_at.getTime())) {
        throw new Error("Published at is not a valid date");
      }
      return {
        uuid: element.uuid,
        name: element.name,
        url: element.url,
        thumbnail: element.thumbnail,
        published_at: new Date(element.published_at),
        subscription_uuid: element.subscription_uuid,
        recommended: element.recommended,
        discouraged: element.discouraged,
        viewed: element.viewed,
        hidden: element.hidden,
        duration: element.duration,
      };
    }),
    nextPage: nextPage,
  };
}
