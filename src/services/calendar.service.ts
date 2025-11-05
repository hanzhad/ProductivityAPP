import { Capacitor } from '@capacitor/core';

export interface CalendarEvent {
  id: string;
  title: string;
  calendarTitle: string;
  location?: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  isAllDay: boolean;
}

export const requestPermissions = async (): Promise<boolean> => {
  if (!Capacitor.isNativePlatform()) {
    console.log('Running in web mode, skipping permissions');
    return true;
  }

  try {
    // Для реальной интеграции используйте @capacitor/calendar
    // const { Calendar } = await import('@capacitor/calendar');
    // const result = await Calendar.requestPermissions();
    // return result.granted;

    // Временно возвращаем true для веб-разработки
    return true;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
};

export const getCalendarEvents = async (): Promise<CalendarEvent[]> => {
  if (!Capacitor.isNativePlatform()) {
    // Возвращаем демо-данные для веб-версии
    return getDemoEvents();
  }

  try {
    // Для реальной интеграции используйте @capacitor/calendar
    // const { Calendar } = await import('@capacitor/calendar');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // const events = await Calendar.listEventsInRange({
    //   startDate: startDate.getTime(),
    //   endDate: endDate.getTime(),
    // });

    // return events.map((event: any) => ({
    //   id: event.id,
    //   title: event.title,
    //   calendarTitle: event.calendarTitle,
    //   location: event.location,
    //   notes: event.notes,
    //   startDate: new Date(event.startDate).toISOString(),
    //   endDate: event.endDate ? new Date(event.endDate).toISOString() : undefined,
    //   isAllDay: event.isAllDay,
    // }));

    // Временно возвращаем демо-данные
    return getDemoEvents();
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
};

const getDemoEvents = (): CalendarEvent[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      id: '1',
      title: 'Встреча с командой',
      calendarTitle: 'Рабочий календарь',
      location: 'Офис, комната 301',
      notes: 'Обсудить планы на следующую неделю',
      startDate: tomorrow.toISOString(),
      endDate: new Date(tomorrow.getTime() + 3600000).toISOString(),
      isAllDay: false,
    },
    {
      id: '2',
      title: 'День рождения',
      calendarTitle: 'Личный календарь',
      notes: 'Не забыть купить подарок!',
      startDate: nextWeek.toISOString(),
      isAllDay: true,
    },
    {
      id: '3',
      title: 'Презентация проекта',
      calendarTitle: 'Рабочий календарь',
      location: 'Zoom',
      notes: 'Подготовить слайды заранее',
      startDate: new Date(now.getTime() + 86400000 * 3).toISOString(),
      endDate: new Date(now.getTime() + 86400000 * 3 + 7200000).toISOString(),
      isAllDay: false,
    },
  ];
};
