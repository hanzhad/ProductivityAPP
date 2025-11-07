import { Capacitor } from '@capacitor/core';
import { ICalendarService } from '../apple/calendar.service.interface';
import { IosCalendarAdapter } from './ios-calendar.adapter';
import { GoogleCalendarAdapter } from './google-calendar.adapter';

/**
 * Calendar Service Factory
 * Returns the appropriate calendar service based on the current platform
 */
class CalendarServiceFactory {
  private static instance: ICalendarService | null = null;

  /**
   * Get the appropriate calendar service for the current platform
   */
  static getCalendarService(): ICalendarService {
    if (this.instance) {
      return this.instance;
    }

    const platform = Capacitor.getPlatform();

    console.log(`Creating calendar service for platform: ${platform}`);

    if (platform === 'ios') {
      this.instance = new IosCalendarAdapter();
    } else {
      // Default to Google Calendar for web and Android
      this.instance = new GoogleCalendarAdapter();
    }

    return this.instance;
  }

  /**
   * Reset the service instance (useful for testing or platform changes)
   */
  static reset() {
    this.instance = null;
  }
}

// Export a singleton instance
export const calendarService = CalendarServiceFactory.getCalendarService();
export { CalendarServiceFactory };
