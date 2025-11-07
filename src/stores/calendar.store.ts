import { createStore } from 'solid-js/store';
import { CalendarEvent } from '../types/google.type';
import { platformTimerManager } from '../utils/platform-timer.manager';

const TIME_OUT = 10 * 1000; // 60 seconds

interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string;
  selectedEventId: string | null;
  currentTime: Date;
  currentDate: Date;
  selectedDate: Date;
}

const [calendarStore, setCalendarStore] = createStore<CalendarState>({
  events: [],
  loading: false,
  error: '',
  selectedEventId: null,
  currentTime: new Date(),
  currentDate: new Date(),
  selectedDate: new Date(),
});

// Timer IDs
let timeUpdateIntervalId: string | null = null;
let midnightTimeoutId: string | null = null;
let resetTodayTimeoutId: string | null = null;
let autoReloadIntervalId: string | null = null;

// Helper functions
const getMillisecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

const isLastDayOfMonth = (date: Date) => {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return date.getDate() === lastDay.getDate();
};

const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

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

  const setCurrentTime = (time: Date) => {
    setCalendarStore('currentTime', time);
  };

  const setCurrentDate = (date: Date) => {
    setCalendarStore('currentDate', date);
  };

  const setSelectedDate = (date: Date) => {
    setCalendarStore('selectedDate', date);
  };

  const previousMonth = async (loadEventsCallback?: () => Promise<void>) => {
    const prev = calendarStore.currentDate;
    setCurrentDate(new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    if (loadEventsCallback) {
      await loadEventsCallback();
    }
  };

  const nextMonth = async (loadEventsCallback?: () => Promise<void>) => {
    const prev = calendarStore.currentDate;
    setCurrentDate(new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    if (loadEventsCallback) {
      await loadEventsCallback();
    }
  };

  const getMonthYearText = (locale: string) => {
    const current = calendarStore.currentDate;
    return current.toLocaleDateString(locale, {
      month: 'long',
      year: 'numeric',
    });
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

  const scheduleNextDayChange = (onDayChange?: () => void) => {
    if (midnightTimeoutId) {
      platformTimerManager.clearInterval(midnightTimeoutId);
      midnightTimeoutId = null;
    }

    const msUntilMidnight = getMillisecondsUntilMidnight();

    // Use a one-time interval that reschedules itself
    midnightTimeoutId = platformTimerManager.setInterval(() => {
      const today = new Date();
      const wasLastDay = isLastDayOfMonth(new Date(today.getTime() - 1000)); // Check yesterday

      setSelectedDate(new Date(today));
      setCurrentDate(new Date(today));
      setCurrentTime(new Date(today));

      // If we just passed the last day of the month, advance to next month
      if (wasLastDay) {
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        setCurrentDate(nextMonth);
      }

      // Trigger callback for reloading events
      if (onDayChange) {
        onDayChange();
      }

      // Clear this timer and schedule the next day change
      if (midnightTimeoutId) {
        platformTimerManager.clearInterval(midnightTimeoutId);
        midnightTimeoutId = null;
      }
      scheduleNextDayChange(onDayChange);
    }, msUntilMidnight);
  };

  const scheduleResetToToday = (selectedDate?: Date) => {
    // Clear any existing timeout
    if (resetTodayTimeoutId) {
      platformTimerManager.clearInterval(resetTodayTimeoutId);
      resetTodayTimeoutId = null;
    }

    const selected = selectedDate || calendarStore.selectedDate;
    const today = new Date();

    // Only schedule reset if a different day is selected
    if (!isSameDay(selected, today)) {
      resetTodayTimeoutId = platformTimerManager.setInterval(() => {
        setSelectedDate(new Date());
        if (resetTodayTimeoutId) {
          platformTimerManager.clearInterval(resetTodayTimeoutId);
          resetTodayTimeoutId = null;
        }
      }, TIME_OUT); // 60 seconds
    }
  };

  const initializeTimers = (onDayChange?: () => void) => {
    // Clear any existing timers first
    cleanupTimers();

    // Job that runs every minute to update current time and check for past events
    timeUpdateIntervalId = platformTimerManager.setInterval(() => {
      setCurrentTime(new Date());
    }, TIME_OUT); // 60 seconds

    // Schedule automatic day change at midnight
    scheduleNextDayChange(onDayChange);
  };

  const startAutoReload = (loadCallback: () => Promise<void>) => {
    // Stop any existing auto-reload timer
    stopAutoReload();

    // Set up platform-aware interval to reload events periodically
    autoReloadIntervalId = platformTimerManager.setInterval(() => {
      console.log('Auto-reloading calendar events...');
      loadCallback(); // Call the loadEvents function
    }, 30 * 1000); // 30 seconds

    console.log('Calendar auto-reload started');
  };

  const stopAutoReload = () => {
    if (autoReloadIntervalId) {
      platformTimerManager.clearInterval(autoReloadIntervalId);
      autoReloadIntervalId = null;
      console.log('Calendar auto-reload stopped');
    }
  };

  const cleanupTimers = () => {
    if (timeUpdateIntervalId) {
      platformTimerManager.clearInterval(timeUpdateIntervalId);
      timeUpdateIntervalId = null;
    }
    if (midnightTimeoutId) {
      platformTimerManager.clearInterval(midnightTimeoutId);
      midnightTimeoutId = null;
    }
    if (resetTodayTimeoutId) {
      platformTimerManager.clearInterval(resetTodayTimeoutId);
      resetTodayTimeoutId = null;
    }
    // Also stop auto-reload when cleaning up all timers
    stopAutoReload();
  };

  const isEventInPast = (event: CalendarEvent) => {
    const now = calendarStore.currentTime;
    const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
    return eventEndDate < now;
  };

  const reset = () => {
    cleanupTimers();
    setCalendarStore({
      events: [],
      loading: false,
      error: '',
      selectedEventId: null,
      currentTime: new Date(),
      currentDate: new Date(),
      selectedDate: new Date(),
    });
  };

  return {
    store: calendarStore,
    setEvents,
    setLoading,
    setError,
    setCurrentTime,
    setCurrentDate,
    setSelectedDate,
    addEvent,
    updateEvent,
    removeEvent,
    clearEvents,
    selectEvent,
    getEventById,
    initializeTimers,
    cleanupTimers,
    scheduleResetToToday,
    isEventInPast,
    previousMonth,
    nextMonth,
    getMonthYearText,
    reset,
    startAutoReload,
    stopAutoReload,
  };
};
