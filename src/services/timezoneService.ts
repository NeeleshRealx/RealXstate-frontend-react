export interface Timezone {
  value: string;
  label: string;
  offset: string;
  region: string;
}

export interface TimezoneApiResponse {
  status: string;
  message: string;
  zones: Timezone[];
}

class TimezoneService {
  private cachedTimezones: Timezone[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Format raw timezone data from API
   */
  private formatTimezoneData(rawTimezones: string[]): Timezone[] {
    return rawTimezones.map(tz => {
      const parts = tz.split('/');
      const region = parts[0] || 'Other';
      const city = parts[parts.length - 1] || tz;
      
      return {
        value: tz,
        label: `${city.replace(/_/g, ' ')} (${region})`,
        offset: this.getTimezoneOffset(tz),
        region: region
      };
    }).sort((a, b) => {
      // Sort by region first, then by city name
      if (a.region !== b.region) {
        return a.region.localeCompare(b.region);
      }
      return a.label.localeCompare(b.label);
    });
  }

  /**
   * Fetch timezones (now uses fallback data directly for reliability)
   */
  async fetchTimezones(): Promise<Timezone[]> {
    // Check if we have cached data and it's still valid
    if (this.cachedTimezones && Date.now() < this.cacheExpiry) {
      return this.cachedTimezones;
    }

    // Use fallback timezones directly instead of API calls
    // This provides better reliability, performance, and offline support
    const fallbackTimezones = this.getFallbackTimezones();
    this.cacheTimezones(fallbackTimezones);
    return fallbackTimezones;
  }

  /**
   * Get timezone offset (simplified version)
   */
  private getTimezoneOffset(timezone: string): string {
    try {
      const date = new Date();
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const targetTime = new Date(utc + (this.getTimezoneOffsetInMinutes(timezone) * 60000));
      const offset = targetTime.getTimezoneOffset();
      
      const hours = Math.abs(Math.floor(offset / 60));
      const minutes = Math.abs(offset % 60);
      const sign = offset <= 0 ? '+' : '-';
      
      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      return 'UTC+00:00';
    }
  }

  /**
   * Get timezone offset in minutes (simplified mapping)
   */
  private getTimezoneOffsetInMinutes(timezone: string): number {
    const offsetMap: { [key: string]: number } = {
      'UTC': 0,
      'GMT': 0,
      'EST': -5 * 60,
      'CST': -6 * 60,
      'MST': -7 * 60,
      'PST': -8 * 60,
      'CET': 1 * 60,
      'JST': 9 * 60,
      'AEST': 10 * 60,
      
      // US Timezones
      'Europe/London': 0,
      'Europe/Paris': 1 * 60,
      'Europe/Berlin': 1 * 60,
      'Europe/Rome': 1 * 60,
      'Europe/Madrid': 1 * 60,
      'Europe/Amsterdam': 1 * 60,
      'Europe/Moscow': 3 * 60,
      
      'America/New_York': -5 * 60,
      'America/Chicago': -6 * 60,
      'America/Denver': -7 * 60,
      'America/Los_Angeles': -8 * 60,
      'America/Anchorage': -9 * 60,
      'America/Toronto': -5 * 60,
      'America/Vancouver': -8 * 60,
      'America/Mexico_City': -6 * 60,
      'America/Sao_Paulo': -3 * 60,
      'America/Argentina/Buenos_Aires': -3 * 60,
      'America/Santiago': -3 * 60,
      
      'Asia/Tokyo': 9 * 60,
      'Asia/Shanghai': 8 * 60,
      'Asia/Kolkata': 5.5 * 60,
      'Asia/Dubai': 4 * 60,
      'Asia/Seoul': 9 * 60,
      'Asia/Singapore': 8 * 60,
      'Asia/Bangkok': 7 * 60,
      'Asia/Manila': 8 * 60,
      
      'Australia/Sydney': 10 * 60,
      'Australia/Perth': 8 * 60,
      'Pacific/Auckland': 12 * 60,
      'Pacific/Honolulu': -10 * 60,
      
      'Africa/Cairo': 2 * 60,
      'Africa/Johannesburg': 2 * 60,
      'Africa/Lagos': 1 * 60,
    };

    return offsetMap[timezone] || 0;
  }

  /**
   * Cache timezones with expiry
   */
  private cacheTimezones(timezones: Timezone[]): void {
    this.cachedTimezones = timezones;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
  }

  /**
   * Get fallback timezones if API fails
   */
  private getFallbackTimezones(): Timezone[] {
    return [
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 'UTC+00:00', region: 'UTC' },
      { value: 'GMT', label: 'GMT (Greenwich Mean Time)', offset: 'UTC+00:00', region: 'GMT' },
      
      // US Timezones with friendly labels
      { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-05:00', region: 'America' },
      { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-06:00', region: 'America' },
      { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-07:00', region: 'America' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-08:00', region: 'America' },
      { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-09:00', region: 'America' },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: 'UTC-10:00', region: 'Pacific' },
      
      // European Timezones
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: 'UTC+00:00', region: 'Europe' },
      { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+01:00', region: 'Europe' },
      { value: 'Europe/Berlin', label: 'Central European Time (CET)', offset: 'UTC+01:00', region: 'Europe' },
      { value: 'Europe/Moscow', label: 'Moscow Standard Time (MSK)', offset: 'UTC+03:00', region: 'Europe' },
      
      // Asian Timezones
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+09:00', region: 'Asia' },
      { value: 'Asia/Shanghai', label: 'China Standard Time (CST)', offset: 'UTC+08:00', region: 'Asia' },
      { value: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+05:30', region: 'Asia' },
      { value: 'Asia/Dubai', label: 'Gulf Standard Time (GST)', offset: 'UTC+04:00', region: 'Asia' },
      { value: 'Asia/Seoul', label: 'Korea Standard Time (KST)', offset: 'UTC+09:00', region: 'Asia' },
      
      // Australian and Pacific Timezones
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: 'UTC+10:00', region: 'Australia' },
      { value: 'Australia/Perth', label: 'Australian Western Time (AWT)', offset: 'UTC+08:00', region: 'Australia' },
      { value: 'Pacific/Auckland', label: 'New Zealand Standard Time (NZST)', offset: 'UTC+12:00', region: 'Pacific' },
      
      // Additional US Cities
      { value: 'America/Toronto', label: 'Toronto (Eastern Time)', offset: 'UTC-05:00', region: 'America' },
      { value: 'America/Vancouver', label: 'Vancouver (Pacific Time)', offset: 'UTC-08:00', region: 'America' },
      { value: 'America/Mexico_City', label: 'Mexico City (Central Time)', offset: 'UTC-06:00', region: 'America' },
      
      // Additional European Cities
      { value: 'Europe/Rome', label: 'Rome (Central European Time)', offset: 'UTC+01:00', region: 'Europe' },
      { value: 'Europe/Madrid', label: 'Madrid (Central European Time)', offset: 'UTC+01:00', region: 'Europe' },
      { value: 'Europe/Amsterdam', label: 'Amsterdam (Central European Time)', offset: 'UTC+01:00', region: 'Europe' },
      
      // Additional Asian Cities
      { value: 'Asia/Singapore', label: 'Singapore (Singapore Time)', offset: 'UTC+08:00', region: 'Asia' },
      { value: 'Asia/Bangkok', label: 'Bangkok (Indochina Time)', offset: 'UTC+07:00', region: 'Asia' },
      { value: 'Asia/Manila', label: 'Manila (Philippine Time)', offset: 'UTC+08:00', region: 'Asia' },
      
      // African Timezones
      { value: 'Africa/Cairo', label: 'Cairo (Eastern European Time)', offset: 'UTC+02:00', region: 'Africa' },
      { value: 'Africa/Johannesburg', label: 'Johannesburg (South Africa Time)', offset: 'UTC+02:00', region: 'Africa' },
      { value: 'Africa/Lagos', label: 'Lagos (West Africa Time)', offset: 'UTC+01:00', region: 'Africa' },
      
      // South American Timezones
      { value: 'America/Sao_Paulo', label: 'São Paulo (Brasília Time)', offset: 'UTC-03:00', region: 'America' },
      { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (Argentina Time)', offset: 'UTC-03:00', region: 'America' },
      { value: 'America/Santiago', label: 'Santiago (Chile Time)', offset: 'UTC-03:00', region: 'America' },
    ];
  }

  /**
   * Get popular timezones for quick access
   */
  async getPopularTimezones(): Promise<Timezone[]> {
    const popularValues = [
      'America/New_York',
      'America/Chicago', 
      'America/Denver',
      'America/Los_Angeles',
      'America/Anchorage',
      'Pacific/Honolulu',
      'Europe/London',
      'Europe/Paris',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Australia/Perth',
      'Pacific/Auckland'
    ];

    const allTimezones = await this.fetchTimezones();
    return allTimezones.filter(tz => popularValues.includes(tz.value));
  }

  /**
   * Get timezones grouped by region
   */
  async getTimezonesByRegion(): Promise<{ [region: string]: Timezone[] }> {
    const timezones = await this.fetchTimezones();
    const grouped: { [region: string]: Timezone[] } = {};
    
    timezones.forEach(tz => {
      if (!grouped[tz.region]) {
        grouped[tz.region] = [];
      }
      grouped[tz.region].push(tz);
    });
    
    return grouped;
  }

  /**
   * Search timezones by query
   */
  async searchTimezones(query: string): Promise<Timezone[]> {
    const timezones = await this.fetchTimezones();
    const lowerQuery = query.toLowerCase();
    
    return timezones.filter(tz => 
      tz.label.toLowerCase().includes(lowerQuery) ||
      tz.value.toLowerCase().includes(lowerQuery) ||
      tz.region.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get current time in a specific timezone
   */
  getCurrentTimeInTimezone(timezone: string): string {
    try {
      const date = new Date();
      return date.toLocaleString('en-US', { timeZone: timezone });
    } catch (error) {
      return new Date().toLocaleString();
    }
  }

  /**
   * Get timezone abbreviation
   */
  getTimezoneAbbreviation(timezone: string): string {
    try {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { timeZone: timezone, timeZoneName: 'short' };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(date);
      const timezonePart = parts.find(part => part.type === 'timeZoneName');
      return timezonePart?.value || timezone.split('/').pop() || timezone;
    } catch (error) {
      return timezone.split('/').pop() || timezone;
    }
  }
}

export const timezoneService = new TimezoneService();
export default timezoneService;
