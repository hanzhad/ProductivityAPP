import { Component, createMemo, For } from 'solid-js';
import { isSameDay } from '../../utils';
import { TCalendarDay } from '../../types';
import { useCalendarStore } from '../../../../stores';
import { useI18n } from '../../../../utils/i18n';
import { weekDays } from '../../constants';

const CalendarGrid: Component = () => {
  const { locale } = useI18n();

  const { store, isEventInPast, setSelectedDate } = useCalendarStore();

  const currentMonthYear = createMemo(() => {
    const date = store.currentDate;
    return date.toLocaleDateString(locale(), {
      month: 'long',
      year: 'numeric',
    });
  });

  const calendarDays = createMemo(() => {
    const current = store.currentDate;
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    // Convert Sunday (0) to 7, so Monday is 0
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const today = new Date();

    const days: TCalendarDay[] = [];

    // Previous month days (to fill from Monday)
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        events: [],
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayEvents = store.events.filter((event) => {
        const eventDate = new Date(event.startDate);
        return isSameDay(eventDate, date);
      });

      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        events: dayEvents,
      });
    }

    // Next month days to fill the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        events: [],
      });
    }

    return days;
  });

  return (
    <div class="flex-1">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
        {/* Month Navigation */}
        <div class="flex items-center justify-center mb-4">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {currentMonthYear()}
          </h3>
        </div>

        {/* Week Days Header */}
        <div class="grid grid-cols-7 gap-1 mb-2">
          <For each={weekDays}>
            {(day) => (
              <div class="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            )}
          </For>
        </div>

        {/* Calendar Days */}
        <div class="grid grid-cols-7 gap-1">
          <For each={calendarDays()}>
            {(day) => (
              <div
                onClick={() => setSelectedDate(day.date)}
                class={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  day.isCurrentMonth
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                } ${day.isToday ? 'ring-2 ring-primary' : ''} ${
                  isSameDay(day.date, store.selectedDate)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                    : ''
                }`}
              >
                <div
                  class={`text-sm font-medium mb-1 ${
                    day.isCurrentMonth
                      ? 'text-gray-900 dark:text-gray-100'
                      : 'text-gray-400 dark:text-gray-600'
                  } ${day.isToday ? 'text-primary font-bold' : ''} ${
                    isSameDay(day.date, store.selectedDate)
                      ? 'text-blue-600 dark:text-blue-400'
                      : ''
                  }`}
                >
                  {day.date.getDate()}
                </div>
                <div class="space-y-1">
                  <For each={day.events}>
                    {(event) => (
                      <div
                        class={`text-xs px-1.5 py-0.5 rounded truncate ${
                          isEventInPast(event)
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-60'
                            : event.isAllDay
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                        }`}
                        title={event.isAllDay ? `${event.title} (All day)` : event.title}
                      >
                        {event.isAllDay && '📅 '}
                        {event.title}
                      </div>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;
