export const readableAgoUnits = (date: Date): { value: number, unit: string } => {
  const difference = new Date().getTime() - date.getTime();
  let value: number;
  let unit_singular: string;
  let unit_plural: string;
  if (difference < 3600000) {
    value = Math.floor(difference / 60000);
    unit_singular = "minute";
    unit_plural = "minutes";
  } else if (difference < 86400000) {
    value = Math.floor(difference / 3600000);
    unit_singular = "hour";
    unit_plural = "hours";
  } else if (difference < 604800000) {
    value = Math.floor(difference / 86400000);
    unit_singular = "day";
    unit_plural = "days";
  } else if (difference < 2419200000) {
    value = Math.floor(difference / 604800000);
    unit_singular = "week";
    unit_plural = "weeks";
  } else if (difference < 31536000000) {
    value = Math.floor(difference / 2419200000);
    unit_singular = "month";
    unit_plural = "months";
  } else {
    value = Math.floor(difference / 31536000000);
    unit_singular = "year";
    unit_plural = "years";
  }
  const unit = value === 1 ? unit_singular : unit_plural;

  return {
    value: value,
    unit: unit
  }
}
