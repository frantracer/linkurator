export type Subscription = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string;
  topicUuid: string;
  followed: boolean;
  isBeingScanned: boolean;
};

export function isBeingScanned(scanned_at: string): boolean {
  return Date.parse(scanned_at) < 946684800000; // It was scanned before 2000-01-01
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
