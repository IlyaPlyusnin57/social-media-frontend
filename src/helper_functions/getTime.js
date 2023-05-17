export function getTime(time) {
  const newTime = new Date(time);
  return new Intl.DateTimeFormat("default", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  }).format(newTime);
}
