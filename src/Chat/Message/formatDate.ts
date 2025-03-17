export default function formatDate(timestamp: string, short = true): string {
  // Create a date object from the timestamp
  const date = new Date(timestamp);

  // Format the local date
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: short ? 'short' : 'long',
    day: '2-digit',
    hour: short ? 'numeric' : '2-digit',
    minute: '2-digit',
    second: short ? undefined : '2-digit',
    hour12: true,
  };
  return date.toLocaleString('en-US', options);
}
