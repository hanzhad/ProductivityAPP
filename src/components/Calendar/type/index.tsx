import { Component, createSignal, onMount, Show } from 'solid-js';
import MouthCalendarView from './MouthCalendarView';
import WeekCalendarView from './WeekCalendarView';
import DayCalendarView from './DayCalendarView';

const CalendarView: Component = () => {
  const [screenSize, setScreenSize] = createSignal<'sm' | 'md' | 'lg' | 'xl'>('xl');

  const updateScreenSize = () => {
    const width = window.innerWidth;
    if (width >= 1280) setScreenSize('xl');
    else if (width >= 1024) setScreenSize('lg');
    else if (width >= 768) setScreenSize('md');
    else setScreenSize('sm');
  };

  onMount(() => {
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  });

  return (
    <>
      <Show when={screenSize() === 'xl'}>
        <MouthCalendarView />
      </Show>
      <Show when={screenSize() === 'lg'}>
        <WeekCalendarView />
      </Show>
      <Show when={screenSize() === 'md'}>
        <DayCalendarView />
      </Show>
    </>
  );
};

export default CalendarView;
