import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import { useI18n } from '../../utils/i18n';
import { useCalendarStore } from '../../stores';
import googleService from '../../utils/google/google.service';
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
    } catch (err: any) {
      console.error('Error loading events:', err?.message || err?.code || err);
      setError(t('errors.loadingEvents'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="">
      <CalendarView />
    </div>
  );
};

export default Calendar;
