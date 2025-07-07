import {Curator} from "../entities/Curators";
import axios from "axios";
import {configuration} from "../configuration";
import {Topic} from "../entities/Topic";
import {SubscriptionItem} from "../entities/SubscriptionItem";
import {replaceBaseUrl} from "../utilities/replaceBaseUrl";
import {isBeingScanned} from "../entities/Subscription";

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

export async function getCurators(): Promise<Curator[]> {
  const {
    data,
    status
  } = await axios.get<Curator[]>(configuration.CURATORS_URL, {withCredentials: true});
  if (status === 200) {
    return data
  } else {
    console.error("Error retrieving curators", data);
    return [];
  }
}

export async function searchCurators(username: string): Promise<Curator[]> {
  if (!username.trim()) {
    return [];
  }

  const {
    data,
    status
  } = await axios.get<Curator[]>(`${configuration.CURATORS_URL}?username=${encodeURIComponent(username)}&mine=false`, {withCredentials: true});
  if (status === 200) {
    return data
  } else {
    console.error("Error searching curators", data);
    return [];
  }
}

export async function followCurator(curatorId: string): Promise<void> {
  const {
    status
  } = await axios.post(configuration.CURATORS_URL + curatorId + "/follow", {}, {withCredentials: true});
  if (status !== 201) {
    console.error("Error following curator", status);
  }
}

export async function unfollowCurator(curatorId: string): Promise<void> {
  const {
    status
  } = await axios.delete(configuration.CURATORS_URL + curatorId + "/follow", {withCredentials: true});
  if (status !== 204) {
    console.error("Error unfollowing curator", status);
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

export async function getCuratorItems(
  curatorId: string | null,
  minDuration: number,
  maxDuration: number,
  searchText: string = "",
): Promise<CuratorItemsResponse> {
  if (curatorId === null) {
    return {elements: [], nextPage: undefined};
  }
  const searchParam = searchText ? "&search=" + searchText : "";
  const minDurationParam = "&min_duration=" + minDuration;
  const maxDurationParam = "&max_duration=" + maxDuration;
  const url = configuration.CURATORS_URL + curatorId + "/items?" + searchParam + minDurationParam + maxDurationParam;

  const {
    data,
    status
  } = await axios.get<CuratorItemsResponse>(url, {withCredentials: true});

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
        subscription: {
          uuid: element.subscription.uuid,
          name: element.subscription.name,
          url: element.subscription.url,
          thumbnail: element.subscription.thumbnail,
          provider: element.subscription.provider,
          topicUuid: element.subscription.topic_uuid,
          followed: element.subscription.followed,
          isBeingScanned: isBeingScanned(element.subscription.scanned_at),
        },
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
