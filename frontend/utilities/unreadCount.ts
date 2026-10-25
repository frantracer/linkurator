const MAX_DISPLAYED_UNREAD_COUNT = 9;

export const formatUnreadCount = (count: number): string => {
  if (count > MAX_DISPLAYED_UNREAD_COUNT) {
    return `${MAX_DISPLAYED_UNREAD_COUNT}+`;
  }
  return count.toString();
}
