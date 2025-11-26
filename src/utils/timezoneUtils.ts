export const timezones: Array<{ value: string; label: string; offset: string }> = [
  { value: 'America/New_York', label: 'Eastern Time (UTC-5:00)', offset: 'UTC-5:00' },
  { value: 'America/Chicago', label: 'Central Time (UTC-6:00)', offset: 'UTC-6:00' },
  { value: 'America/Denver', label: 'Mountain Time (UTC-7:00)', offset: 'UTC-7:00' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8:00)', offset: 'UTC-8:00' },
  { value: 'America/Phoenix', label: 'Arizona Time (UTC-7:00)', offset: 'UTC-7:00' },
  { value: 'America/Anchorage', label: 'Alaska Time (UTC-9:00)', offset: 'UTC-9:00' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (UTC-10:00)', offset: 'UTC-10:00' },
  { value: 'Europe/London', label: 'London Time (UTC+0:00)', offset: 'UTC+0:00' },
  { value: 'Europe/Paris', label: 'Paris Time (UTC+1:00)', offset: 'UTC+1:00' },
  { value: 'Europe/Berlin', label: 'Berlin Time (UTC+1:00)', offset: 'UTC+1:00' },
  { value: 'Asia/Tokyo', label: 'Tokyo Time (UTC+9:00)', offset: 'UTC+9:00' },
  { value: 'Asia/Shanghai', label: 'Shanghai Time (UTC+8:00)', offset: 'UTC+8:00' },
  { value: 'Asia/Kolkata', label: 'India Time (UTC+5:30)', offset: 'UTC+5:30' },
  { value: 'Australia/Sydney', label: 'Sydney Time (UTC+10:00)', offset: 'UTC+10:00' },
  { value: 'Australia/Melbourne', label: 'Melbourne Time (UTC+10:00)', offset: 'UTC+10:00' },
];

export const getTimezoneLabel = (timezone: string): string => {
  const tz = timezones.find(t => t.value === timezone);
  return tz ? tz.label : timezone;
};

export const getTimezoneOffset = (timezone: string): string => {
  const tz = timezones.find(t => t.value === timezone);
  return tz ? tz.offset : '';
};

export const formatTimezoneForDisplay = (timezone: string): string => {
  // Convert timezone to display format like "America/Los_Angeles"
  return timezone.replace('_', '/');
};