export function getMonthAndDay(time) {
  const date = new Date(time);
  return new Intl.DateTimeFormat("default", {
    month: "long",
    day: "numeric",
  }).format(date);
}
