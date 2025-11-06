import { Component, createEffect, createMemo, createSignal, For, onCleanup, onMount, Show, } from 'solid-js';
import { Button } from '@kobalte/core/button';
import { getLocaleDateFormat, useI18n } from '../utils/i18n';
import { useCalendarStore } from '../stores';
import GoogleAuthButton from './GoogleAuthButton';
import googleService from '../utils/google/google.service';
import { CalendarEvent } from '../types/google.type';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

const CalendarView: Component = () => {
  const { t, locale } = useI18n();
  const { store, setEvents, setLoading, setError } = useCalendarStore();
  const [currentDate, setCurrentDate] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal<Date>(new Date());
  let timeoutId: number | undefined;

  onMount(async () => {
    await loadEvents();
  });

  onCleanup(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  });

  // Reset to today after 60 seconds when a different day is selected
  createEffect(() => {
    const selected = selectedDate();
    const today = new Date();

    if (!isSameDay(selected, today)) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setSelectedDate(new Date());
        timeoutId = undefined;
      }, 60000) as unknown as number; // 60 seconds
    } else {
      // Clear timer if today is selected
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    }
  });

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const current = currentDate();
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(getLocaleDateFormat(locale()), {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const localeFormat = getLocaleDateFormat(locale());
    return date.toLocaleDateString(localeFormat, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const calendarDays = createMemo(() => {
    const current = currentDate();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const today = new Date();

    const days: CalendarDay[] = [];

    // Previous month days
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

  const selectedDayEvents = createMemo(() => {
    const selected = selectedDate();
    return store.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return isSameDay(eventDate, selected);
    });
  });

  const monthYearText = createMemo(() => {
    const current = currentDate();
    return current.toLocaleDateString(getLocaleDateFormat(locale()), {
      month: 'long',
      year: 'numeric',
    });
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
    return selectedDate().toLocaleDateString(getLocaleDateFormat(locale()), {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  });

  const previousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    loadEvents();
  };

  const nextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    loadEvents();
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(new Date(today));
    loadEvents();
  };

  const selectDay = (date: Date) => {
    setSelectedDate(new Date(date));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {t('calendar.title')}
        </h2>
        <Button
          onClick={goToToday}
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Today
        </Button>
      </div>

      <GoogleAuthButton />

      <Show when={store.error}>
        <div class="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
          {store.error}
        </div>
      </Show>

      <div class="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div class="flex-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4">
            {/* Month Navigation */}
            <div class="flex items-center justify-between mb-4">
              <Button
                onClick={previousMonth}
                class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                ← Prev
              </Button>
              <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {monthYearText()}
              </h3>
              <Button
                onClick={nextMonth}
                class="px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Next →
              </Button>
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
                    onClick={() => selectDay(day.date)}
                    class={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      day.isCurrentMonth
                        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800'
                    } ${day.isToday ? 'ring-2 ring-primary' : ''} ${
                      isSameDay(day.date, selectedDate())
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
                        isSameDay(day.date, selectedDate())
                          ? 'text-blue-600 dark:text-blue-400'
                          : ''
                      }`}
                    >
                      {day.date.getDate()}
                    </div>
                    <div class="space-y-1">
                      <For each={day.events}>
                        {(event) => (
                          <div class="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded truncate">
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

        {/* Selected Day's Events Panel */}
        <div class="lg:w-80">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 p-4 sticky top-4 min-h-[400px]">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isSameDay(selectedDate(), new Date())
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
                  {(event) => (
                    <div class="border-l-4 border-blue-500 pl-3 py-2">
                      <h4 class="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                        {event.title}
                      </h4>
                      <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        🕐 {formatTime(event.startDate)}
                        <Show when={event.endDate}>{' - ' + formatTime(event.endDate!)}</Show>
                      </div>
                      <Show when={event.location}>
                        <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          📍 {event.location}
                        </div>
                      </Show>
                      <Show when={event.calendarTitle}>
                        <span class="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded text-xs">
                          {event.calendarTitle}
                        </span>
                      </Show>
                      <Show when={event.notes}>
                        <div class="mt-2 text-xs text-gray-700 dark:text-gray-300">
                          {event.notes}
                        </div>
                      </Show>
                    </div>
                  )}
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
