import {configuration} from "../configuration";
import axios from "axios";
import {Provider} from "../entities/Provider";

const mapJsonToProvider = (json: Record<string, any>): Provider => {
  return {
    name: json.name,
    prettyName: json.alias,
    iconUrl: json.thumbnail,
  };
};

export async function getProviders(): Promise<Provider[]> {
  let providers: Provider[] = [];
  try {
    const {data, status} = await axios.get(configuration.PROVIDERS_URL);
    if (status === 200) {
      providers = data.map((element: Record<string, any>) => mapJsonToProvider(element));
    }
  } catch (error: any) {
    console.error("Error retrieving providers", error);
  }
  return providers;
}
