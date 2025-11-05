import { createStore } from 'solid-js/store';
import { CalendarEvent } from '../services/calendar.service';

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  selectedEventId: string | null;
}

const [calendarStore, setCalendarStore] = createStore<CalendarState>({
  events: [],
  loading: false,
  error: '',
  selectedEventId: null,
});

export const useCalendarStore = () => {
  const setEvents = (events: CalendarEvent[]) => {
    setCalendarStore('events', events);
  };

  const setLoading = (loading: boolean) => {
    setCalendarStore('loading', loading);
  };

  const setError = (error: string) => {
    setCalendarStore('error', error);
  };

  const addEvent = (event: CalendarEvent) => {
    setCalendarStore('events', (events) => [...events, event]);
  };

  const updateEvent = (id: string, updatedEvent: Partial<CalendarEvent>) => {
    setCalendarStore('events', (e) => e.id === id, updatedEvent);
  };

  const removeEvent = (id: string) => {
    setCalendarStore('events', (events) => events.filter((e) => e.id !== id));
  };

  const clearEvents = () => {
    setCalendarStore('events', []);
  };

  const selectEvent = (id: string | null) => {
    setCalendarStore('selectedEventId', id);
  };

  const getEventById = (id: string) => {
    return calendarStore.events.find((e) => e.id === id);
  };

  const reset = () => {
    setCalendarStore({
      events: [],
      loading: false,
      error: '',
      selectedEventId: null,
    });
  };

  return {
    store: calendarStore,
    setEvents,
    setLoading,
    setError,
    addEvent,
    updateEvent,
    removeEvent,
    clearEvents,
    selectEvent,
    getEventById,
    reset,
  };
};
