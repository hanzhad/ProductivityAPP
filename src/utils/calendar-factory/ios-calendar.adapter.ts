import { Capacitor } from '@capacitor/core';
import { ICalendarService } from '../apple/calendar.service.interface';
import { CalendarEvent } from '../../types/google.type';
import { appleCalendarService } from '../apple/apple-calendar.service';

/**
 * iOS Calendar Service
 * Uses Apple's EventKit to access calendar events
 */
export class IosCalendarAdapter implements ICalendarService {
  private initialized = false;

  isAvailable(): boolean {
    return Capacitor.getPlatform() === 'ios';
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('iOS Calendar is only available on iOS platform');
    }

    // Check and request permissions
    try {
      const hasPermission = await appleCalendarService.checkPermissions();
      if (!hasPermission) {
        console.warn('Calendar permission not granted, requesting...');
        const granted = await appleCalendarService.requestPermissions();
        if (!granted) {
          console.warn('Calendar permission denied by user');
          this.initialized = false;
          // Don't throw error - let the app continue without calendar access
          return;
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Error initializing iOS Calendar:', error);
      this.initialized = false;
      // Don't throw - let the app continue
    }
  }

  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // If still not initialized after initialization attempt, return empty array
    if (!this.initialized) {
      console.error('iOS Calendar not available - permission denied or initialization failed');
      return [];
    }

    try {
      const iosEvents = await appleCalendarService.getEvents(startDate, endDate);

      // Convert iOS calendar events to unified CalendarEvent format
      return iosEvents.map((event) => ({
        id: event.id,
        title: event.title,
        calendarTitle: event.calendarTitle,
        location: event.location,
        notes: event.notes,
        startDate: event.startDate,
        endDate: event.endDate,
        isAllDay: event.isAllDay,
      }));
    } catch (error) {
      console.error('Error fetching iOS calendar events:', error);
      return [];
    }
  }

  async getCalendars() {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.initialized) {
      return [];
    }

    try {
      const calendars = await appleCalendarService.getCalendars();
      return calendars.map((cal) => ({
        id: cal.id,
        title: cal.title,
        color: cal.color,
      }));
    } catch (error) {
      console.error('Error fetching iOS calendars:', error);
      return [];
    }
  }
}
