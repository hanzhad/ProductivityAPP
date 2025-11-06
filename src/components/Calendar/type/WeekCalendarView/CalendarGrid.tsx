import { Component, createEffect, createMemo, For } from 'solid-js';
import { isSameDay } from '../../utils';
import { TCalendarDay } from '../../types';
import { useI18n } from '../../../../utils/i18n';
import { useCalendarStore } from '../../../../stores';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarGrid: Component = () => {
  const { locale } = useI18n();

  const { store, isEventInPast, setSelectedDate } = useCalendarStore();

  const scrollToCurrentDay = () => {
    const days = weekDaysData();
    const todayIndex = days.findIndex((day) => day.isToday);

    if (todayIndex !== -1) {
      const todayElement = document.querySelector('[data-is-today="true"]');
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Auto-scroll to current day
  createEffect(() => {
    scrollToCurrentDay();
    const interval = setInterval(() => {
      scrollToCurrentDay();
    }, 60000);

    return () => clearInterval(interval);
  });

  const weekDaysData = createMemo(() => {
    const current = store.currentDate;
    const currentDay = current.getDay();
    const today = new Date();

    // Get Sunday of current week
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - currentDay);

    const days: TCalendarDay[] = [];

    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);

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

    return days;
  });

  return (
    <div class="flex-1">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
        {/* Week Days Grid - Vertical */}
        <div class="flex flex-col gap-3">
          <For each={weekDaysData()}>
            {(day, index) => (
              <div
                data-is-today={day.isToday}
                onClick={() => setSelectedDate(day.date)}
                class={`flex gap-4 p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  day.isToday
                    ? 'ring-2 ring-primary bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-white dark:bg-gray-800'
                } ${
                  isSameDay(day.date, store.selectedDate)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Day Header - Left Side */}
                <div class="flex flex-col items-center justify-center min-w-[40px]">
                  <div class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    {weekDays[index()]}
                  </div>
                  <div
                    class={`text-2xl font-bold mt-1 ${
                      day.isToday
                        ? 'bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {day.date.toLocaleDateString(locale(), { month: 'short' })}
                  </div>
                </div>

                {/* Day Content - Right Side */}
                <div class="flex-1 min-h-[60px]">
                  <div class="flex flex-wrap gap-2">
                    <For each={day.events}>
                      {(event) => {
                        const startTime = new Date(event.startDate).toLocaleTimeString(locale(), {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true,
                        });
                        return (
                          <div
                            class={`text-sm px-3 py-2 rounded-lg flex-shrink-0 max-w-[100px] ${
                              isEventInPast(event)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 line-through opacity-60'
                                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                            }`}
                            title={event.title}
                          >
                            <div class="font-semibold">{startTime}</div>
                            <div class="font-medium truncate">{event.title}</div>
                          </div>
                        );
                      }}
                    </For>
                    {day.events.length === 0 && (
                      <div class="text-sm text-gray-400 dark:text-gray-600 italic py-2">
                        No events
                      </div>
                    )}
                  </div>
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
