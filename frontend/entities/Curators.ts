export type Curator = {
  id: string
  username: string
  avatar_url: string
  followed: boolean
}

export function curatorSorting(c1: Curator, c2: Curator): number {
  const name1 = c1.username.toLowerCase();
  const name2 = c2.username.toLowerCase();
  if (name1 < name2) {
    return -1;
  }
  if (name1 > name2) {
    return 1;
  }
  return 0;
}
