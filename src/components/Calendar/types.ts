import { CalendarEvent } from '../../types/google.type';

export type TCalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
};
