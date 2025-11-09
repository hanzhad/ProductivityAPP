import { Component, createMemo, Show } from 'solid-js';
import { CalendarEvent } from '../../../types/google.type';
import { formatEventTime } from '../utils';
import cn from 'classnames';
import { useI18n } from '../../../utils/i18n';

type EventItemProps = {
  event: CalendarEvent;
  class: string;
  isPast: boolean;
};

const EventItem: Component<EventItemProps> = (props) => {
  const { locale } = useI18n();

  const event = createMemo(() => props.event);

  return (
    <div data-event-id={event().id} class={cn('border-l-4 pl-3 py-2 transition-all', props.class)}>
      <h4
        class={`font-semibold text-sm mb-1 ${
          props.isPast
            ? 'text-gray-500 dark:text-gray-500 line-through'
            : 'text-gray-900 dark:text-gray-100'
        }`}
      >
        {event().title}
      </h4>
      <div
        class={`text-xs mb-1 ${
          props.isPast ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {event().isAllDay ? '📅' : '🕐'}{' '}
        {formatEventTime(event().startDate, event().endDate, locale(), event().isAllDay)}
      </div>
      <Show when={event().location}>
        <div
          class={`text-xs mb-1 ${
            props.isPast ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          📍 {event().location}
        </div>
      </Show>
      <Show when={event().calendarTitle}>
        <span
          class={`inline-block px-2 py-0.5 rounded text-xs ${
            props.isPast
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-500'
              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
          }`}
        >
          {event().calendarTitle}
        </span>
      </Show>
      <Show when={event().notes}>
        <div
          class={`mt-2 text-xs ${
            props.isPast ? 'text-gray-500 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {event().notes}
        </div>
      </Show>
    </div>
  );
};

export default EventItem;
