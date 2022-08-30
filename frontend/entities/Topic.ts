export type Topic = {
  uuid: string;
  name: string;
  subscriptions_ids: string[];
};

export function topicSorting(a: Topic, b: Topic): number {
  return a.name.localeCompare(b.name);
}