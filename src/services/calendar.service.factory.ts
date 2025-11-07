import { Capacitor } from '@capacitor/core';
import { ICalendarService } from './calendar.service.interface';
import { IOSCalendarService } from './iosCalendar.service';
import { GoogleCalendarService } from './googleCalendar.service';

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
      this.instance = new IOSCalendarService();
    } else {
      // Default to Google Calendar for web and Android
      this.instance = new GoogleCalendarService();
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
