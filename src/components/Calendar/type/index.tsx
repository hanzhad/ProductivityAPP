import { Component } from 'solid-js';
import MouthCalendarView from './MouthCalendarView';
import WeekCalendarView from './WeekCalendarView';
import DayCalendarView from './DayCalendarView';

const CalendarView: Component = () => {
  return (
    <>
      <div class="hidden xl:block">
        <MouthCalendarView />
      </div>
      <div class="hidden lg:block xl:hidden">
        <WeekCalendarView />
      </div>
      <div class="hidden md:block lg:hidden">
        <DayCalendarView />
      </div>
    </>
  );
};

export default CalendarView;
