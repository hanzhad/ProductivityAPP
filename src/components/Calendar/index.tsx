import { Component, createEffect, createMemo, For, onCleanup, onMount, Show } from 'solid-js';
import { getLocaleDateFormat, useI18n } from '../../utils/i18n';
import { useCalendarStore } from '../../stores';
import GoogleAuthButton from '../GoogleAuthButton';
import googleService from '../../utils/google/google.service';
import { formatTime, isSameDay } from './utils';
import CalendarGrid from './CalendarGrid';

const CalendarView: Component = () => {
  const { t, locale } = useI18n();
  const {
    store,
    setEvents,
    setLoading,
    setError,
    initializeTimers,
    cleanupTimers,
    scheduleResetToToday,
    isEventInPast,
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

  const selectedDayEvents = createMemo(() => {
    const selected = store.selectedDate;
    return store.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selected);
    });
  });

  const nextUpcomingEvent = createMemo(() => {
    const events = selectedDayEvents();
    const now = store.currentTime;

    // Find the first event that hasn't ended yet
    const upcoming = events.find((event) => {
      const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate);
      return eventEndDate >= now;
    });

    return upcoming;
  });

  // Auto-scroll to next upcoming event when current event becomes past
  createEffect(() => {
    const nextEvent = nextUpcomingEvent();

    if (nextEvent && isSameDay(store.selectedDate, new Date())) {
      // Only auto-scroll on today's events
      const eventElement = document.querySelector(`[data-event-id="${nextEvent.id}"]`);
      if (eventElement) {
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  const todayFormatted = createMemo(() => {
    const today = new Date();
    return today.toLocaleDateString(getLocaleDateFormat(locale()), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  });

  const selectedDayFormatted = createMemo(() => {
    return store.selectedDate.toLocaleDateString(getLocaleDateFormat(locale()), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  });

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
        <div class="lg:w-80">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 sticky top-4 min-h-[400px]">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isSameDay(store.selectedDate, new Date())
                ? `Today  ${todayFormatted()}`
                : selectedDayFormatted()}
            </h3>

            <Show when={store.loading}>
              <div class="flex flex-col items-center justify-center py-8 gap-3">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {t('calendar.loadingEvents')}
                </p>
              </div>
            </Show>

            <Show when={!store.loading && selectedDayEvents().length === 0}>
              <p class="text-gray-500 dark:text-gray-400 text-sm">No events scheduled</p>
            </Show>

            <Show when={!store.loading}>
              <div class="space-y-3">
                <For each={selectedDayEvents()}>
                  {(event) => {
                    const isPast = isEventInPast(event);
                    const isNextUpcoming = nextUpcomingEvent()?.id === event.id;
                    return (
                      <div
                        data-event-id={event.id}
                        class={`border-l-4 pl-3 py-2 transition-all ${
                          isPast
                            ? 'border-gray-400 dark:border-gray-600 opacity-50'
                            : isNextUpcoming
                              ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20'
                              : 'border-blue-500'
                        }`}
                      >
                        <h4
                          class={`font-semibold text-sm mb-1 ${
                            isPast
                              ? 'text-gray-500 dark:text-gray-500 line-through'
                              : 'text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          {event.title}
                        </h4>
                        <div
                          class={`text-xs mb-1 ${
                            isPast
                              ? 'text-gray-400 dark:text-gray-600'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          🕐 {formatTime(event.startDate, locale())}
                          <Show when={event.endDate}>
                            {' - ' + formatTime(event.endDate!, locale())}
                          </Show>
                        </div>
                        <Show when={event.location}>
                          <div
                            class={`text-xs mb-1 ${
                              isPast
                                ? 'text-gray-400 dark:text-gray-600'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            📍 {event.location}
                          </div>
                        </Show>
                        <Show when={event.calendarTitle}>
                          <span
                            class={`inline-block px-2 py-0.5 rounded text-xs ${
                              isPast
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500'
                                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                            }`}
                          >
                            {event.calendarTitle}
                          </span>
                        </Show>
                        <Show when={event.notes}>
                          <div
                            class={`mt-2 text-xs ${
                              isPast
                                ? 'text-gray-500 dark:text-gray-600'
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {event.notes}
                          </div>
                        </Show>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
