import { formatEventTime, isSameDay } from '../utils';
import { Component, createEffect, createMemo, For, Show } from 'solid-js';
import { getLocaleDateFormat, useI18n } from '../../../utils/i18n';
import { useCalendarStore } from '../../../stores';
import cn from 'classnames';

type TEvent = {
  roundedFull?: boolean;
  class?: string;
};

const EventsPanel: Component<TEvent> = (props) => {
  const { t, locale } = useI18n();

  const { store, isEventInPast } = useCalendarStore();

  const isSameDayMemo = createMemo(() => {
    const today = store.currentDate;
    const selected = store.selectedDate;
    return isSameDay(today, selected);
  });

  const todayFormatted = createMemo(() => {
    const today = store.currentDate;
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

  const selectedDayEvents = createMemo(() => {
    const selected = store.selectedDate;
    return store.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selected);
    });
  });

  const nextUpcomingEvent = createMemo(() => {
    const events = selectedDayEvents();

    // Find the first event that hasn't ended yet (is not in the past)
    return events.find((event) => {
      if (!isSameDayMemo()) {
        return false;
      }

      if (event.isAllDay) {
        return false;
      }
      return !isEventInPast(event);
    });
  });

  // Auto-scroll to next upcoming event when current event becomes past
  createEffect(() => {
    const nextEvent = nextUpcomingEvent();

    if (nextEvent && isSameDayMemo()) {
      // Only auto-scroll on today's events
      const eventElement = document.querySelector(`[data-event-id="${nextEvent.id}"]`);
      if (eventElement) {
        eventElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  });

  return (
    <div class="lg:w-80 h-full">
      <div
        class={`bg-white dark:bg-gray-800 rounded-t-lg shadow dark:shadow-gray-900/50 p-4 sticky top-4 h-full ${props.roundedFull ? 'rounded-lg' : 'rounded-t-lg'}`}
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {isSameDayMemo() ? `Today  ${todayFormatted()}` : selectedDayFormatted()}
        </h3>

        <Show when={store.error}>
          <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
            {store.error}
          </div>
        </Show>

        <Show when={store.loading}>
          <div class="flex flex-col items-center justify-center py-8 gap-3">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p class="text-gray-600 dark:text-gray-400 text-sm">{t('calendar.loadingEvents')}</p>
          </div>
        </Show>

        <Show when={!store.loading && selectedDayEvents().length === 0}>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{t('calendar.noEventsScheduled')}</p>
        </Show>

        <Show when={!store.loading}>
          <div class={cn('space-y-3', props.class)}>
            <For each={selectedDayEvents()}>
              {(event) => {
                const isPast = isSameDayMemo() ? isEventInPast(event) : false;
                const isNextUpcoming = nextUpcomingEvent()?.id === event.id;
                return (
                  <div
                    data-event-id={event.id}
                    class={`border-l-4 pl-3 py-2 transition-all ${
                      isPast
                        ? 'border-gray-400 dark:border-gray-600 opacity-50'
                        : isNextUpcoming && !isPast
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
                      {event.isAllDay ? '📅' : '🕐'}{' '}
                      {formatEventTime(event.startDate, event.endDate, locale(), event.isAllDay)}
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
  );
};

export default EventsPanel;
