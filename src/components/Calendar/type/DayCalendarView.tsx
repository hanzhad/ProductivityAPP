import { Component, createMemo } from 'solid-js';
import EventsPanel from '../components/EventsPanel';
import { useI18n } from '../../../utils/i18n';
import { useCalendarStore } from '../../../stores';

const DayCalendarView: Component = () => {
  const { locale } = useI18n();

  const { store } = useCalendarStore();

  const currentMonthYear = createMemo(() => {
    const date = store.currentDate;
    return date.toLocaleDateString(locale(), {
      month: 'long',
      year: 'numeric',
    });
  });

  return (
    <div>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-900/50 text-center py-2 mb-2">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">{currentMonthYear()}</h3>
      </div>

      <div>
        <EventsPanel class="max-h-[calc(100vh-16px-44px-8px-44px-16px-8px)] h-full overflow-y-auto" />
      </div>
    </div>
  );
};

export default DayCalendarView;
