import { createStore } from 'solid-js/store';
import { CalendarEvent } from '../types/google.type';
import { platformTimerManager } from '../utils/platform-timer.manager';
import { calendarService } from '../utils/calendar-factory/calendar.service.factory';
import { App } from '@capacitor/app';

const RESET_TO_TODAY_TIMEOUT = 60 * 1000; // 60 seconds - time before auto-reset to today

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

// Timer IDs and listener references
let timeUpdateIntervalId: string | null = null;
let midnightTimeoutId: string | null = null;
let resetTodayTimeoutId: string | null = null;
let autoReloadIntervalId: string | null = null;
let appStateListener: any = null;

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

const areEventsEqual = (events1: CalendarEvent[], events2: CalendarEvent[]) => {
  if (events1.length !== events2.length) return false;

  // Sort both arrays by id for comparison
  const sorted1 = [...events1].sort((a, b) => a.id.localeCompare(b.id));
  const sorted2 = [...events2].sort((a, b) => a.id.localeCompare(b.id));

  return sorted1.every((event, index) => {
    const otherEvent = sorted2[index];
    return (
      event.id === otherEvent.id &&
      event.title === otherEvent.title &&
      event.startDate === otherEvent.startDate &&
      event.endDate === otherEvent.endDate &&
      event.location === otherEvent.location &&
      event.notes === otherEvent.notes
    );
  });
};

export const useCalendarStore = () => {
  const setEvents = (events: CalendarEvent[], forceUpdate = false) => {
    // Only update if events have changed or force update is requested
    if (forceUpdate || !areEventsEqual(calendarStore.events, events)) {
      setCalendarStore('events', events);
    }
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
      const now = new Date();
      const wasLastDay = isLastDayOfMonth(new Date(now.getTime() - 1000)); // Check yesterday

      // Update all date/time references to the new day
      setSelectedDate(now);
      setCurrentDate(now);
      setCurrentTime(now);

      // If we just passed the last day of the month, advance currentDate to next month
      // (This ensures the calendar view shows the correct month)
      if (wasLastDay) {
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
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
      }, RESET_TO_TODAY_TIMEOUT);
    }
  };

  const initializeTimers = (onDayChange?: () => void) => {
    // Clear any existing timers first (but not app listener)
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

    // Job that runs every second to update current time for real-time event tracking
    timeUpdateIntervalId = platformTimerManager.setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      // Note: currentDate is NOT updated here - it represents the calendar view date
      // and should only change at midnight or when user navigates months
    }, 1000); // 1 second for responsive event state updates

    // Schedule automatic day change at midnight
    scheduleNextDayChange(onDayChange);
  };

  const startAutoReload = (loadCallback: () => void | Promise<void>) => {
    // Stop any existing auto-reload timer
    stopAutoReload();

    // Set up platform-aware interval to reload events periodically
    autoReloadIntervalId = platformTimerManager.setInterval(() => {
      loadCallback(); // Call the loadEvents function
    }, 30 * 1000); // 30 seconds
  };

  const stopAutoReload = () => {
    if (autoReloadIntervalId) {
      platformTimerManager.clearInterval(autoReloadIntervalId);
      autoReloadIntervalId = null;
    }
  };

  const cleanup = () => {
    // Clear all timers
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

    // Stop auto-reload
    stopAutoReload();

    // Remove app state listener
    if (appStateListener) {
      appStateListener.remove();
      appStateListener = null;
    }
  };

  const isEventInPast = (event: CalendarEvent) => {
    const now = calendarStore.currentTime;

    // For all-day events, only mark as past if the entire day has passed
    if (event.isAllDay) {
      const eventDate = new Date(event.startDate);
      const today = new Date(now);
      // Set both dates to midnight for day-only comparison
      eventDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return eventDate < today;
    }

    // For timed events, use the end time
    const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
    return eventEndDate < now;
  };

  const loadEvents = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');
      const current = calendarStore.currentDate;
      const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
      const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      // Initialize calendar service if not already done
      if (calendarService.isAvailable()) {
        try {
          await calendarService.initialize();
          const calendarEvents = await calendarService.fetchEvents(startOfMonth, endOfMonth);
          setEvents(calendarEvents);
        } catch (err: any) {
          // If permission is denied or initialization fails, just show empty calendar
          console.warn('Calendar not accessible:', err?.message || err);
          setEvents([]);
          // Don't set error - let the calendar show as empty
        }
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.error('Error loading events:', err?.message || err?.code || err);
      // Only set error for unexpected errors
      if (err?.message && !err.message.includes('permission')) {
        setError('Error loading events');
      }
    } finally {
      setLoading(false);
    }
  };

  const initialize = async () => {
    // Load initial events
    await loadEvents();

    // Initialize all timer jobs (updates time every second, auto day/month change)
    initializeTimers(loadEvents);

    // Start auto-reload timer for periodic event syncing (silent mode to avoid flickering)
    startAutoReload(() => loadEvents(true));

    // Listen for app state changes to resync calendar when app resumes
    appStateListener = await App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        await loadEvents();
      }
    });
  };

  const reset = () => {
    cleanup();
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
    scheduleResetToToday,
    isEventInPast,
    previousMonth,
    nextMonth,
    getMonthYearText,
    initialize,
    cleanup,
    loadEvents,
  };
};
