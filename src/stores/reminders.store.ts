import { createStore } from 'solid-js/store';
import { platformTimerManager } from '../utils/platform-timer.manager';
import { Reminder, ReminderPriority, ReminderStatus } from '../types/remiders.type';

const TIME_OUT = 10 * 1000;

type RemindersStore = {
  reminders: Reminder[];
  loading: boolean;
  error: string;
  selectedTaskId: string | null;
  filterStatus: ReminderStatus[];
  filterPriority: ReminderPriority[];
  filterTags: string[];
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  viewFilter: 'all' | 'active' | 'completed';
  autoReloadInterval: string | null;
};

const [remindersStore, setRemindersStore] = createStore<RemindersStore>({
  reminders: [],
  loading: false,
  error: '',
  selectedTaskId: null,
  filterStatus: [],
  filterPriority: [],
  filterTags: [],
  sortBy: 'createdAt',
  sortOrder: 'desc',
  viewFilter: 'all',
  autoReloadInterval: null,
});

export const useRemindersStore = () => {
  const setReminders = (reminders: Reminder[]) => {
    setRemindersStore('reminders', reminders);
  };

  const setLoading = (loading: boolean) => {
    setRemindersStore('loading', loading);
  };

  const setError = (error: string) => {
    setRemindersStore('error', error);
  };

  const reset = () => {
    // Stop auto-reload before resetting
    stopAutoReload();

    setRemindersStore({
      reminders: [],
      loading: false,
      error: '',
      selectedTaskId: null,
      filterStatus: [],
      filterPriority: [],
      filterTags: [],
      sortBy: 'createdAt',
      sortOrder: 'desc',
      viewFilter: 'all',
      autoReloadInterval: null,
    });
  };

  const loadReminders = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError('');

      // Try to load from Apple Reminders if on iOS
      const { appleRemindersService } = await import('../utils/apple/apple-reminders.service');

      if (!appleRemindersService.isIOS()) {
        setReminders([]);
        return;
      }

      try {
        const reminders = await appleRemindersService.getTasks(false);
        setReminders(reminders);
        return;
      } catch (error: any) {
        console.error(
          'Failed to load Apple Reminders, falling back to demo data:',
          error?.message || error?.code || error
        );
        if (!silent) {
          setError('errors.appleRemindersAccess');
        }
      }
    } catch (e: any) {
      console.error('Error loading reminders:', e?.message || e?.code || e);
      if (!silent) {
        setError('errors.loadingTasks');
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  const startAutoReload = async () => {
    // Stop any existing interval
    stopAutoReload();

    // Check if we're on iOS before starting auto-reload
    const { appleRemindersService } = await import('../utils/apple/apple-reminders.service');
    if (!appleRemindersService.isIOS()) {
      return;
    }

    // Set up platform-aware interval to reload reminders
    const timerId = platformTimerManager.setInterval(() => {
      loadReminders(true); // Silent reload
    }, TIME_OUT);

    setRemindersStore('autoReloadInterval', timerId);
  };

  const stopAutoReload = () => {
    if (
      remindersStore.autoReloadInterval !== null &&
      remindersStore.autoReloadInterval !== undefined
    ) {
      platformTimerManager.clearInterval(remindersStore.autoReloadInterval);
      setRemindersStore('autoReloadInterval', null);
    }
  };

  return {
    store: remindersStore,
    setReminders,
    setLoading,
    setError,
    reset,
    loadReminders,
    startAutoReload,
    stopAutoReload,
  };
};
