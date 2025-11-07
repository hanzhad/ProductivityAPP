import { Capacitor } from '@capacitor/core';
import { ICalendarService } from '../apple/calendar.service.interface';
import { CalendarEvent } from '../../types/google.type';
import googleService from '../google/google.service';

/**
 * Google Calendar Service
 * Uses Google Calendar API to access calendar events
 */
export class GoogleCalendarAdapter implements ICalendarService {
  private initialized = false;

  isAvailable(): boolean {
    // Google Calendar is available on web and Android
    const platform = Capacitor.getPlatform();
    return platform === 'web' || platform === 'android';
  }

  async initialize(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Google Calendar is not available on this platform');
    }

    try {
      await googleService.initialize();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Google Calendar:', error);
      throw error;
    }
  }

  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Check if user is signed in
    if (!googleService.isSignedIn()) {
      console.warn('User not signed in to Google Calendar');
      return [];
    }

    try {
      return await googleService.fetchEvents(startDate, endDate);
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
      throw error;
    }
  }

  async getCalendars() {
    if (!this.initialized) {
      await this.initialize();
    }

    // Google Calendar API doesn't expose calendar list in the current implementation
    // Return empty array for now
    return [];
  }
}
