export function timeToDayMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function localDayMinutesToGmt(minutes: number): number {
  const now = new Date();
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  now.setHours(hours);
  now.setMinutes(mins);
  const gmtHours = now.getUTCHours();
  const gmtMinutes = now.getUTCMinutes();

  return gmtHours * 60 + gmtMinutes;
}

export function gmtDayMinutesToLocale(gmtMinutes: number): number {
  const now = new Date();
  const hours = Math.floor(gmtMinutes / 60);
  const mins = gmtMinutes % 60;

  now.setUTCHours(hours);
  now.setUTCMinutes(mins);

  const localHours = now.getHours();
  const localMinutes = now.getMinutes();

  return localHours * 60 + localMinutes;
}
