export const timeElapsed = (createdAt: number): String => {
  const timeElapsedMilliseconds = Date.now() - createdAt;
  const timeElapsedMinutes = timeElapsedMilliseconds / (1000 * 60);

  if (timeElapsedMinutes < 1) {
    return "< 1 min";
  }

  if (timeElapsedMinutes < 60) {
    return timeElapsedMinutes === 1
      ? "1 min"
      : `${Math.floor(timeElapsedMinutes)} minutes`;
  }

  const timeElapsedHours = timeElapsedMinutes / 60;

  if (timeElapsedHours < 24) {
    return timeElapsedHours === 1
      ? "1 hour"
      : `${Math.floor(timeElapsedHours)} hours`;
  }

  const timeElapsedDays = timeElapsedHours / 24;

  if (timeElapsedDays < 365) {
    return timeElapsedDays === 1
      ? "1 day"
      : `${Math.floor(timeElapsedDays)} days`;
  }

  const timeElapsedYears = timeElapsedDays / 364;

  return timeElapsedYears === 1
    ? "1 year"
    : `${Math.floor(timeElapsedYears)} years`;
};
