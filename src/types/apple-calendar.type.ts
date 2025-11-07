export interface AppleCalendarEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location: string;
  notes: string;
  url?: string;
  calendarId: string;
  calendarTitle: string;
  calendarColor: string;
  hasReminder: boolean;
  reminderMinutes?: number;
}

export interface AppleCalendarInfo {
  id: string;
  title: string;
  color: string;
  isSubscribed: boolean;
  allowsContentModifications: boolean;
}

export interface AppleCalendarPlugin {
  /**
   * Check if calendar permission is granted
   */
  checkCalendarPermissions(): Promise<{ granted: boolean }>;

  /**
   * Request permission to access calendar
   */
  requestCalendarPermissions(): Promise<{ granted: boolean }>;

  /**
   * Fetch calendar events within a date range
   */
  getEvents(options: {
    startDate: string;
    endDate: string;
  }): Promise<{ events: AppleCalendarEvent[] }>;

  /**
   * Get list of calendars
   */
  getCalendars(): Promise<{ calendars: AppleCalendarInfo[] }>;
}
