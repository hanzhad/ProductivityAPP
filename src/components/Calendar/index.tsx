import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import { App } from '@capacitor/app';
import { useI18n } from '../../utils/i18n';
import { useCalendarStore } from '../../stores';
import { calendarService } from '../../utils/calendar-factory/calendar.service.factory';
import CalendarView from './type';

const Calendar: Component = () => {
  const { t } = useI18n();
  const {
    store,
    setEvents,
    setLoading,
    setError,
    initializeTimers,
    cleanupTimers,
    scheduleResetToToday,
    startAutoReload,
  } = useCalendarStore();

  let appStateListener: any;

  onMount(async () => {
    await loadEvents();

    // Initialize all timer jobs (updates time every minute, auto day/month change)
    initializeTimers(loadEvents);

    // Start auto-reload timer for periodic event syncing (silent mode to avoid flickering)
    startAutoReload(() => loadEvents(true));

    // Listen for app state changes to resync calendar when app resumes
    appStateListener = await App.addListener('appStateChange', async (state) => {
      if (state.isActive) {
        await loadEvents();
      }
    });
  });

  onCleanup(() => {
    cleanupTimers();
    if (appStateListener) {
      appStateListener.remove();
    }
  });

  // Reset to today after 60 seconds when a different day is selected
  createEffect(() => {
    // Track selectedDate as dependency
    const selected = store.selectedDate;
    scheduleResetToToday(selected);
  });

  const loadEvents = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');
      const current = store.currentDate;
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
        setError(t('errors.loadingEvents'));
      }
    } finally {
      setLoading(false);
    }
  };

  return <CalendarView />;
};

export default Calendar;
