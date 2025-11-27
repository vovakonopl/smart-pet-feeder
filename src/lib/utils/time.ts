export const formatGmtToLocalTime = (gmtIso: string): string => {
  const date = new Date(gmtIso);

  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    // hour12: true,
  });
};
