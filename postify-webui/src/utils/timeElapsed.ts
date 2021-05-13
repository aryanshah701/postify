export const timeElapsed = (createdAt: number): String => {
  const timeElapsedMilliseconds = Date.now() - createdAt;
  const timeElapsedHours = Math.floor(
    timeElapsedMilliseconds / (1000 * 1000 * 60 * 60)
  );
  const timeElapsedDays = Math.floor(timeElapsedHours / 24);
  const timeElapsedYears = Math.floor(timeElapsedDays / 364);

  if (timeElapsedYears >= 1) {
    return timeElapsedYears === 1 ? "1 year" : `${timeElapsedYears} years`;
  }

  if (timeElapsedDays >= 1) {
    return timeElapsedDays === 1 ? "1 day" : `${timeElapsedDays} days`;
  }

  if (timeElapsedHours >= 1) {
    return timeElapsedHours === 1 ? "1 hour" : `${timeElapsedHours} hours`;
  }

  return "< 1 hour";
};
