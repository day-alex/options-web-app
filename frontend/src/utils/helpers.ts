export const formatDate = (isoString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC', // avoids local timezone shift
  }).format(new Date(isoString));
};

export function daysUntilToday(futureDateString: string) {
  const today = new Date();
  const futureDate = new Date(futureDateString);

  // Calculate the difference in milliseconds
  const timeDiff = futureDate.getTime() - today.getTime();

  // Convert milliseconds to days
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff / 365;
}
