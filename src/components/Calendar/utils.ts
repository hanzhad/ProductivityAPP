import { getLocaleDateFormat, Language } from '../../utils/i18n';

export const formatTime = (dateString: string, locale: Language) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(getLocaleDateFormat(locale), {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
