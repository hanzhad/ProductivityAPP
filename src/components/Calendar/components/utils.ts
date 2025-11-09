import { CalendarEvent } from '../../../types/google.type';

export enum EventTimeTypeEnum {
  ALL_DAY_EVENT = 'allDay',
  PAST_EVENT = 'past',
  CURRENT_EVENT = 'current',
  NEXT_EVENT = 'next',
  UPCOMING_EVENT = 'upcoming',
}

export const getEventTimeType = (
  event: CalendarEvent,
  events: CalendarEvent[],
  isSameDay: boolean,
  currentTime: Date
): EventTimeTypeEnum => {
  if (event.isAllDay) {
    return EventTimeTypeEnum.ALL_DAY_EVENT;
  }

  if (!isSameDay) {
    return EventTimeTypeEnum.UPCOMING_EVENT;
  }

  const eventStartDate = new Date(event.startDate);
  const eventEndDate = event.endDate ? new Date(event.endDate) : eventStartDate;

  if (isEventCurrent(event, currentTime)) {
    return EventTimeTypeEnum.CURRENT_EVENT;
  }

  if (eventEndDate < currentTime) {
    return EventTimeTypeEnum.PAST_EVENT;
  }

  if (isEventNext(events, event, currentTime)) {
    return EventTimeTypeEnum.NEXT_EVENT;
  }

  return EventTimeTypeEnum.UPCOMING_EVENT;
};

const isEventCurrent = (event: CalendarEvent, currentTime: Date) => {
  const currentTimestamp = currentTime.getTime();

  const eventStartTimestamp = new Date(event.startDate).getTime();
  const eventEndTimestamp = event.endDate ? new Date(event.endDate).getTime() : eventStartTimestamp;

  return eventStartTimestamp <= currentTimestamp && currentTimestamp <= eventEndTimestamp;
};

export const getNextEvents = (events: CalendarEvent[], currentTime: Date) => {
  const list = events
    .filter(
      (event) =>
        new Date(event.startDate).getTime() > currentTime.getTime() ||
        isEventCurrent(event, currentTime)
    )
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const nextEvent = list.find((a) => new Date(a.startDate).getTime() > currentTime.getTime());

  if (!nextEvent) return [];

  const nextEvents = list.filter(
    (a) => new Date(a.startDate).getTime() === new Date(nextEvent?.startDate).getTime()
  );

  return nextEvents;
};

const isEventNext = (events: CalendarEvent[], event: CalendarEvent, currentTime: Date) => {
  const nextEvents = getNextEvents(events, currentTime);
  return nextEvents.find(({ id }) => id === event.id) !== undefined;
};

export const getNextEvent = (
  events: CalendarEvent[],
  currentTime: Date
): CalendarEvent | undefined => {
  const nextEvents = getNextEvents(events, currentTime);
  return nextEvents.shift();
};

export const eventTimeTypeToStyle = (eventType: EventTimeTypeEnum) => {
  switch (eventType) {
    case EventTimeTypeEnum.ALL_DAY_EVENT:
      return 'border-purple-900';
    case EventTimeTypeEnum.CURRENT_EVENT:
      return 'border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20 animate-pulse';
    case EventTimeTypeEnum.PAST_EVENT:
      return 'border-gray-400 dark:border-gray-600 opacity-50';
    case EventTimeTypeEnum.UPCOMING_EVENT:
      return 'border-blue-500';
    case EventTimeTypeEnum.NEXT_EVENT: {
      return 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20';
    }
  }
};
