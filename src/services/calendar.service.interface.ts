import { CalendarEvent } from '../types/google.type';

/**
 * Unified calendar service interface
 * Works across different platforms (Google Calendar, iOS Calendar, etc.)
 */
export interface ICalendarService {
  /**
   * Check if the calendar service is available and initialized
   */
  isAvailable(): boolean;

  /**
   * Initialize the calendar service
   */
  initialize(): Promise<void>;

  /**
   * Fetch calendar events within a date range
   */
  fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;

  /**
   * Get list of available calendars
   */
  getCalendars?(): Promise<Array<{ id: string; title: string; color?: string }>>;
}
