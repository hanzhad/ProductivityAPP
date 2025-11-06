import { GoogleAuth } from './google-auth.service';
import { CalendarEvent } from '../../types/google.type';

/**
 * GoogleCalendar - Handles Google Calendar API operations
 * This class depends on GoogleAuth for authentication and token management
 */
export class GoogleCalendar {
  constructor(private readonly auth: GoogleAuth) {}

  /**
   * Fetch calendar events from Google Calendar
   * @param timeMin - Start date for events (defaults to now)
   * @param timeMax - End date for events (defaults to one month from now)
   */
  public async fetchEvents(timeMin?: Date, timeMax?: Date): Promise<CalendarEvent[]> {
    await this.ensureAuthenticated();

    try {
      const now = timeMin || new Date();
      const oneMonthLater = timeMax || new Date();
      if (!timeMax) {
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      }

      console.log('Fetching calendar events...', {
        timeMin: now.toISOString(),
        timeMax: oneMonthLater.toISOString(),
      });

      const calendar = this.getCalendarClient();
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        timeMax: oneMonthLater.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 50,
        orderBy: 'startTime',
      });

      console.log('Calendar events fetched successfully', {
        count: response.result.items?.length || 0,
      });

      const events = response.result.items;

      if (!events || events.length === 0) {
        console.log('No upcoming events found.');
        return [];
      }

      return events.map((event: any) => this.mapEventToCalendarEvent(event));
    } catch (error: any) {
      console.error('Error fetching Google Calendar events:', error);

      // Handle authentication errors specifically
      if (error?.status === 401 || error?.result?.error?.code === 401) {
        console.error('Authentication error: Token may be invalid or expired');
        throw new Error(
          'Authentication failed. Please sign out and sign in again. Error: ' +
            (error?.result?.error?.message || error?.message || 'Unknown error')
        );
      }

      // Handle insufficient scope errors
      if (error?.status === 403 || error?.result?.error?.code === 403) {
        const errorMessage = error?.result?.error?.message || '';
        if (errorMessage.includes('insufficient') || errorMessage.includes('scope')) {
          console.error('Scope error: Token missing required permissions');
          throw new Error(
            '⚠️  Calendar access permission is missing. Please sign out and sign in again to grant full access.'
          );
        }
      }

      throw error;
    }
  }

  /**
   * Get all user's calendars
   */
  public async getCalendarList(): Promise<any[]> {
    await this.ensureAuthenticated();

    try {
      const calendar = this.getCalendarClient();
      const response = await calendar.calendarList.list();
      return response.result.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw error;
    }
  }

  // /**
  //  * Get user's primary calendar email
  //  */
  // public async getUserEmail(): Promise<string> {
  //   await this.ensureAuthenticated();
  //
  //   try {
  //     const calendar = this.getCalendarClient();
  //     const response = await calendar.calendarList.get({
  //       calendarId: 'primary',
  //     });
  //     return response.result.id;
  //   } catch (error) {
  //     console.error('Error getting user email:', error);
  //     return '';
  //   }
  // }

  /**
   * Fetch events from a specific calendar
   * @param calendarId - The ID of the calendar to fetch events from
   * @param timeMin - Start date for events
   * @param timeMax - End date for events
   */
  public async fetchEventsFromCalendar(
    calendarId: string,
    timeMin?: Date,
    timeMax?: Date
  ): Promise<CalendarEvent[]> {
    await this.ensureAuthenticated();

    try {
      const now = timeMin || new Date();
      const oneMonthLater = timeMax || new Date();
      if (!timeMax) {
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      }

      const calendar = this.getCalendarClient();
      const response = await calendar.events.list({
        calendarId: calendarId,
        timeMin: now.toISOString(),
        timeMax: oneMonthLater.toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults: 50,
        orderBy: 'startTime',
      });

      const events = response.result.items;
      return events ? events.map((event: any) => this.mapEventToCalendarEvent(event)) : [];
    } catch (error) {
      console.error(`Error fetching events from calendar ${calendarId}:`, error);
      throw error;
    }
  }

  /**
   * Ensure user is authenticated before making API calls
   */
  private async ensureAuthenticated(): Promise<void> {
    console.log('=== Authentication Check ===');

    await this.auth.ensureInitialized();
    console.log('✓ Auth initialized');

    if (!this.auth.isSignedIn()) {
      console.error('✗ User not signed in');
      throw new Error('User is not signed in to Google Calendar. Please sign in first.');
    }
    console.log('✓ User is signed in');

    // Refresh token if expired
    await this.auth.refreshTokenIfNeeded();

    // Verify token is present and valid
    const token = this.auth.getToken();
    console.log('Token check:', {
      exists: !!token,
      hasAccessToken: !!token?.access_token,
      tokenLength: token?.access_token?.length || 0,
      scopes: token?.scope,
    });

    if (!token || !token.access_token) {
      console.error('✗ No valid access token');
      throw new Error('No valid access token available. Please sign in again.');
    }

    // Check if token has required calendar scopes
    const requiredScopes = ['calendar.readonly'];
    const hasCalendarScope = requiredScopes.some((scope) =>
      token.scope?.toLowerCase().includes(scope.toLowerCase())
    );

    if (!hasCalendarScope) {
      console.warn('⚠️  Token missing required calendar scopes');
      console.log('Current scopes:', token.scope);
      console.log('🔄 Attempting to request calendar permissions...');

      try {
        // Request additional scopes without signing out
        await this.auth.requestAdditionalScopes();
        console.log('✓ Calendar permissions granted');
      } catch (error) {
        console.error('Failed to request calendar permissions:', error);
        throw new Error(
          '⚠️  Calendar access permission is required. Please sign out and sign in again to grant calendar access.'
        );
      }
    }

    console.log('✓ Authentication verified, token present');
    console.log('Token info:', this.auth.getTokenInfo());
    console.log('===========================');
  }

  /**
   * Get the authenticated calendar client
   */
  private getCalendarClient(): any {
    const client = this.auth.getGapiClient();
    if (!client?.calendar) {
      throw new Error('Calendar API client not available');
    }
    return client.calendar;
  }

  /**
   * Map Google Calendar event to our CalendarEvent interface
   */
  private mapEventToCalendarEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      title: event.summary || 'No Title',
      calendarTitle: 'Google Calendar',
      location: event.location,
      notes: event.description,
      startDate: event.start.dateTime || event.start.date,
      endDate: event.end?.dateTime || event.end?.date,
      isAllDay: !event.start.dateTime,
    };
  }
}
