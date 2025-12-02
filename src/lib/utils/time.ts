export const formatGmtToLocalTime = (gmtIso: string): string => {
  const date = new Date(gmtIso);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const normalizeScheduleItemTime = (itemMinutes: number): string => {
  const hours = Math.floor(itemMinutes / 60);
  const minutes = itemMinutes % 60;

  return `${hours}:${minutes}`;
};
