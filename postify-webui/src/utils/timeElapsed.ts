export const timeElapsed = (createdAt: number): String => {
  const timeElapsedMilliseconds = Date.now() - createdAt;
  const timeElapsedMinutes = timeElapsedMilliseconds / (1000 * 60);

  if (timeElapsedMinutes < 1) {
    return "< 1 min";
  }

  if (timeElapsedMinutes < 60) {
    const roundedMinutes = Math.floor(timeElapsedMinutes);
    return roundedMinutes === 1 ? "1 minute" : `${roundedMinutes} minutes`;
  }

  const timeElapsedHours = timeElapsedMinutes / 60;

  if (timeElapsedHours < 24) {
    const roundedHours = Math.floor(timeElapsedHours);
    return roundedHours === 1 ? "1 hour" : `${roundedHours} hours`;
  }

  const timeElapsedDays = timeElapsedHours / 24;

  if (timeElapsedDays < 365) {
    const roundedDays = Math.floor(timeElapsedDays);
    return roundedDays === 1 ? "1 day" : `${roundedDays} days`;
  }

  const timeElapsedYears = Math.floor(timeElapsedDays / 364);

  return timeElapsedYears === 1
    ? "1 year"
    : `${Math.floor(timeElapsedYears)} years`;
};
