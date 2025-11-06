import { Component } from 'solid-js';
import MouthCalendarView from './MouthCalendarView';
import WeekCalendarView from './WeekCalendarView';

const CalendarView: Component = () => {
  return (
    <>
      <div class="hidden xl:block">
        <MouthCalendarView />
      </div>
      <div class="hidden md:block">
        <WeekCalendarView />
      </div>
    </>
  );
};

export default CalendarView;
