import { Component } from 'solid-js';
import CalendarGrid from './CalendarGrid';
import EventsPanel from '../../components/EventsPanel';

const MouthCalendarView: Component = () => {
  return (
    <div class="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <CalendarGrid />

      {/* Selected Day's Events Panel */}
      <EventsPanel roundedFull class="max-h-[calc(100vh-16px-44px-8px)] h-full overflow-y-auto" />
    </div>
  );
};

export default MouthCalendarView;
