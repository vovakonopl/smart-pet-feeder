export function timeToDayMinutes(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}
