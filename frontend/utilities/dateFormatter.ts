export const readableAgoUnits = (date: Date) => {
  const difference = new Date().getTime() - date.getTime();
  let value: number;
  let unit_singular;
  let unit_plural;
  if (difference < 3600000) {
    value = Math.floor(difference / 60000);
    unit_singular = "minuto";
    unit_plural = "minutos";
  } else if (difference < 86400000) {
    value = Math.floor(difference / 3600000);
    unit_singular = "hora";
    unit_plural = "horas";
  } else if (difference < 604800000) {
    value = Math.floor(difference / 86400000);
    unit_singular = "día";
    unit_plural = "días";
  } else if (difference < 2419200000) {
    value = Math.floor(difference / 604800000);
    unit_singular = "semana";
    unit_plural = "semanas";
  } else if (difference < 31536000000) {
    value = Math.floor(difference / 2419200000);
    unit_singular = "mes";
    unit_plural = "meses";
  } else {
    value = Math.floor(difference / 31536000000);
    unit_singular = "año";
    unit_plural = "años";
  }
  const unit = value === 1 ? unit_singular : unit_plural;

  return `hace ${value} ${unit}`;
}
