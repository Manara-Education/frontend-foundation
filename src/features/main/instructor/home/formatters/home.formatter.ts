export function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} ساعة${minutes > 0 ? ` و ${minutes} دقيقة` : ""}`;
  }
  return `${Math.max(1, minutes)} دقيقة`;
}
