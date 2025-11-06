import { Component, createEffect, onCleanup, onMount, Show } from 'solid-js';
import { useI18n } from '../../utils/i18n';
import { useCalendarStore } from '../../stores';
import GoogleAuthButton from '../GoogleAuthButton';
import googleService from '../../utils/google/google.service';
import CalendarGrid from './CalendarGrid';
import EventsPanel from './EventsPanel';

const CalendarView: Component = () => {
  const { t } = useI18n();
  const {
    store,
    setEvents,
    setLoading,
    setError,
    initializeTimers,
    cleanupTimers,
    scheduleResetToToday,
  } = useCalendarStore();

  onMount(async () => {
    await loadEvents();

    // Initialize all timer jobs (updates time every minute, auto day/month change)
    initializeTimers(loadEvents);
  });

  onCleanup(() => {
    cleanupTimers();
  });

  // Reset to today after 60 seconds when a different day is selected
  createEffect(() => {
    scheduleResetToToday();
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const current = store.currentDate;
      const startOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
      const endOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      const calendarEvents = await googleService.fetchEvents(startOfMonth, endOfMonth);
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(t('errors.loadingEvents'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-7xl mx-auto px-4">
      <GoogleAuthButton />

      <Show when={store.error}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {store.error}
        </div>
      </Show>

      <div class="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <CalendarGrid />

        {/* Selected Day's Events Panel */}
        <EventsPanel />
      </div>
    </div>
  );
};

export default CalendarView;
