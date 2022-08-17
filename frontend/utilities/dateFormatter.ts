export const readableAgoUnits = (date: Date) => {
  const difference = new Date().getTime() - date.getTime();
  let value: number;
  let unit: string;
  if (difference < 3600000) {
    value = Math.floor(difference / 60000);
    unit = "minute";
  } else if (difference < 86400000) {
    value = Math.floor(difference / 3600000);
    unit = "hour";
  } else if (difference < 604800000) {
    value = Math.floor(difference / 86400000);
    unit = "day";
  } else if (difference < 2419200000) {
    value = Math.floor(difference / 604800000);
    unit = "week";
  } else if (difference < 31536000000) {
    value = Math.floor(difference / 2419200000);
    unit = "month";
  } else {
    value = Math.floor(difference / 31536000000);
    unit = "year";
  }
  if (value !== 1) {
    unit += "s";
  }

  return `${value} ${unit} ago`;
}