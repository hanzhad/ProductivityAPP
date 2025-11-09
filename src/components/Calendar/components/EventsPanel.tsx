import { isSameDay } from '../utils';
import { Component, createEffect, createMemo, For, Show } from 'solid-js';
import { getLocaleDateFormat, useI18n } from '../../../utils/i18n';
import { useCalendarStore } from '../../../stores';
import cn from 'classnames';
import { EventTimeTypeEnum, eventTimeTypeToStyle, getEventTimeType, getNextEvent } from './utils';
import EventItem from './EventItem';

type TEvent = {
  roundedFull?: boolean;
  class?: string;
};

const EventsPanel: Component<TEvent> = (props) => {
  const { t, locale } = useI18n();

  const { store } = useCalendarStore();

  const currentTime = createMemo(() => {
    return store.currentTime;
  });

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
    return store.events
      .filter((event) => {
        const eventDate = new Date(event.startDate);
        return isSameDay(eventDate, selected);
      })
      .sort((eventA, eventB) => {
        const fullDayA = eventA.isAllDay ? 0 : 1;
        const fullDayB = eventB.isAllDay ? 0 : 1;
        if (fullDayA !== fullDayB) {
          return fullDayA - fullDayB;
        }
        const eventATime = new Date(eventA.startDate);
        const eventBTime = new Date(eventB.startDate);
        return eventATime.getTime() - eventBTime.getTime();
      });
  });

  const nextEvent = createMemo(() => {
    return getNextEvent(selectedDayEvents(), currentTime());
  });

  // Auto-scroll to current ongoing event, or next upcoming event
  createEffect(() => {
    const _currentTime = currentTime();

    const isSameDay = isSameDayMemo();

    if (!isSameDay) {
      return;
    }

    const id = nextEvent()?.id;

    if (!id) {
      return;
    }

    const eventElement = document.querySelector(`[data-event-id="${id}"]`);

    if (eventElement) {
      eventElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  return (
    <div class="lg:w-80 h-full">
      <div
        class={`bg-white dark:bg-gray-800 rounded-t-lg shadow dark:shadow-gray-900/50 p-4 ${props.roundedFull ? 'rounded-lg' : 'rounded-t-lg'}`}
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
                // Evaluate these once for all events in the list
                const type = getEventTimeType(
                  event,
                  selectedDayEvents(),
                  isSameDayMemo(),
                  currentTime()
                );

                return (
                  <EventItem
                    event={event}
                    isPast={type === EventTimeTypeEnum.PAST_EVENT}
                    class={eventTimeTypeToStyle(type)}
                  />
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
