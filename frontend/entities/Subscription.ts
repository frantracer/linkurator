export type Subscription = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string;
  isBeingScanned: boolean;
};

export function subscriptionSorting(s1: Subscription, s2: Subscription): number {
  if (s1.name < s2.name) {
    return -1;
  }
  if (s1.name > s2.name) {
    return 1;
  }
  return 0;
}
