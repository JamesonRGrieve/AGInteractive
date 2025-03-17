import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Converts a UTC timestamp to local time
 * @param timestamp - UTC timestamp string
 * @returns Local timestamp string
 */
export function convertToLocalTime(timestamp: string): string {
  return dayjs.utc(timestamp).local().format();
}

/**
 * Converts an object's timestamp fields from UTC to local time
 * @param obj - Object containing timestamp fields
 * @param timestampFields - Array of field names that contain timestamps
 * @returns Object with converted timestamps
 */
export function convertTimestampsToLocal<T extends Record<string, any>>(obj: T, timestampFields: (keyof T)[]): T {
  const result = { ...obj };

  timestampFields.forEach((field) => {
    if (result[field]) {
      result[field] = convertToLocalTime(result[field] as string) as T[keyof T];
    }
  });

  return result;
}
