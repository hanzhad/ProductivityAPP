import { Component, onMount, For, Show } from 'solid-js';
import { Button } from '@kobalte/core/button';
import { getCalendarEvents } from '../services/calendar.service';
import { useI18n, getLocaleDateFormat } from '../utils/i18n';
import { useCalendarStore } from '../stores';

const CalendarView: Component = () => {
  const { t, locale } = useI18n();
  const { store, setEvents, setLoading, setError } = useCalendarStore();

  onMount(async () => {
    await loadEvents();
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const calendarEvents = await getCalendarEvents();
      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(t('errors.loadingEvents'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeFormat = getLocaleDateFormat(locale());
    return date.toLocaleDateString(localeFormat, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t('calendar.title')}</h2>
        <Button
          onClick={loadEvents}
          disabled={store.loading}
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
        >
          {store.loading ? t('common.refreshing') : t('common.refresh')}
        </Button>
      </div>

      <Show when={store.error}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {store.error}
        </div>
      </Show>

      <Show when={store.loading}>
        <div class="flex flex-col items-center justify-center py-12 gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-gray-600 dark:text-gray-400">{t('calendar.loadingEvents')}</p>
        </div>
      </Show>

      <Show when={!store.loading && store.events.length === 0}>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-12 text-center">
          <p class="text-xl text-gray-500 dark:text-gray-400">{t('calendar.noEvents')}</p>
        </div>
      </Show>

      <div class="flex flex-col gap-4">
        <For each={store.events}>
          {(event) => (
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-shadow p-5 active:scale-[0.98]">
              <div class="flex justify-between items-start mb-3 gap-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">{event.title}</h3>
                <span class="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                  {event.calendarTitle}
                </span>
              </div>
              <div class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                <span>🕐 {formatDate(event.startDate)}</span>
                <Show when={event.endDate}>
                  <span> - {formatDate(event.endDate!)}</span>
                </Show>
              </div>
              <Show when={event.location}>
                <div class="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  📍 {event.location}
                </div>
              </Show>
              <Show when={event.notes}>
                <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {event.notes}
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};

export default CalendarView;
