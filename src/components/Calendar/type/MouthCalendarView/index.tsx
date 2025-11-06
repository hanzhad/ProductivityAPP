import { Component } from 'solid-js';
import CalendarGrid from './CalendarGrid';
import EventsPanel from '../../components/EventsPanel';

const MouthCalendarView: Component = () => {
  return (
    <div class="flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid */}
      <CalendarGrid />

      {/* Selected Day's Events Panel */}
      <EventsPanel />
    </div>
  );
};

export default MouthCalendarView;
