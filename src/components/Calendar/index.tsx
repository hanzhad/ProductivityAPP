import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import { useCalendarStore } from '../../stores';
import CalendarView from './type';

const Calendar: Component = () => {
  const { store, initialize, cleanup, scheduleResetToToday } = useCalendarStore();

  onMount(initialize);

  onCleanup(cleanup);

  // Reset to today after 60 seconds when a different day is selected
  createEffect(() => {
    // Track selectedDate as dependency
    const selected = store.selectedDate;
    scheduleResetToToday(selected);
  });

  return <CalendarView />;
};

export default Calendar;
