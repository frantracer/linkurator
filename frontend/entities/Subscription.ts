export type Subscription = {
  uuid: string;
  name: string;
  url: string;
  thumbnail: string;
  isBeingScanned: boolean;
};

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
