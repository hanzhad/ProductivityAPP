import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  AppleCalendarEvent,
  AppleCalendarInfo,
  AppleCalendarPlugin,
} from '../types/apple-calendar.type';

const AppleCalendar = registerPlugin<AppleCalendarPlugin>('AppleCalendar', {
  web: () => ({
    checkCalendarPermissions: async () => ({ granted: false }),
    requestCalendarPermissions: async () => ({ granted: false }),
    getEvents: async () => ({ events: [] }),
    getCalendars: async () => ({ calendars: [] }),
  }),
});

export const appleCalendarService = {
  /**
   * Check if running on iOS
   */
  isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  },

  /**
   * Check if we have permission to access calendar
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.isIOS()) {
      return false;
    }

    try {
      const result = await AppleCalendar.checkCalendarPermissions();
      return result.granted;
    } catch (error: any) {
      console.error('Error checking calendar permissions:', error?.message || error?.code || error);
      return false;
    }
  },

  /**
   * Request permission to access calendar
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isIOS()) {
      return false;
    }

    try {
      const result = await AppleCalendar.requestCalendarPermissions();
      return result.granted;
    } catch (error: any) {
      console.error(
        'Error requesting calendar permissions:',
        error?.message || error?.code || error
      );
      return false;
    }
  },

  /**
   * Fetch calendar events within a date range
   */
  async getEvents(startDate: Date, endDate: Date): Promise<AppleCalendarEvent[]> {
    if (!this.isIOS()) {
      return [];
    }

    try {
      // Check if we have permission
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        // Request permission
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Permission denied to access calendar');
        }
      }

      // Fetch events
      const result = await AppleCalendar.getEvents({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      return result.events;
    } catch (error: any) {
      console.error('Error fetching calendar events:', error?.message || error?.code || error);
      throw error;
    }
  },

  /**
   * Get list of calendars
   */
  async getCalendars(): Promise<AppleCalendarInfo[]> {
    if (!this.isIOS()) {
      return [];
    }

    try {
      const result = await AppleCalendar.getCalendars();
      return result.calendars;
    } catch (error: any) {
      console.error('Error fetching calendars:', error?.message || error?.code || error);
      return [];
    }
  },
};
