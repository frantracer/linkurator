export type SubscriptionProvider = "youtube" | "spotify" | "rss"

export type Subscription = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string;
  provider: SubscriptionProvider;
  topicUuid: string;
  followed: boolean;
  isBeingScanned: boolean;
};

export function isBeingScanned(scanned_at: string): boolean {
  return Date.parse(scanned_at) < 946684800000; // It was scanned before 2000-01-01
}

export function subscriptionFiltering(subscription: Subscription, searchValue: string): boolean {
  return subscription.name.toLowerCase().includes(searchValue.toLowerCase());
}

export function subscriptionSorting(s1: Subscription, s2: Subscription): number {
  const name1 = s1.name.toLowerCase();
  const name2 = s2.name.toLowerCase();
  if (name1 < name2) {
    return -1;
  }
  if (name1 > name2) {
    return 1;
  }
  return 0;
}

export function providerIconUrl(provider: SubscriptionProvider): string {
  switch (provider) {
    case "youtube":
      return "https://www.youtube.com/favicon.ico";
    case "spotify":
      return "https://duckduckgo.com/assets/icons/favicons/spotify.2x.png";
    case "rss":
      return "https://upload.wikimedia.org/wikipedia/en/4/43/Feed-icon.svg";
  }
}

export function providerPrettyName(provider: SubscriptionProvider): string {
  switch (provider) {
    case "youtube":
      return "YouTube";
    case "spotify":
      return "Spotify";
    case "rss":
      return "RSS";
  }
}