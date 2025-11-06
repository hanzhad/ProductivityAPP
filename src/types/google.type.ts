export type CalendarEvent = {
  id: string;
  title: string;
  calendarTitle: string;
  location?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
};

export type GoogleUserProfileType = {
  id: string;
  name: string;
  givenName: string;
  familyName: string;
  imageUrl: string;
  email: string;
};
