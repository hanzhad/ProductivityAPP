import { Capacitor, registerPlugin } from '@capacitor/core';
import { AppleReminder, AppleRemindersPlugin } from '../../types/apple-reminders.type';
import { Task, TaskPriority } from '../../stores';

const AppleReminders = registerPlugin<AppleRemindersPlugin>('AppleReminders', {
  web: () => ({
    checkPermissions: async () => ({ granted: false }),
    requestPermissions: async () => ({ granted: false }),
    getReminders: async () => ({ reminders: [] }),
    getReminderLists: async () => ({ lists: [] }),
  }),
});

/**
 * Convert Apple priority (0-9) to app priority (low, medium, high)
 */
const convertPriority = (applePriority: number): TaskPriority => {
  if (applePriority >= 1 && applePriority <= 4) {
    return 'high';
  } else if (applePriority === 5) {
    return 'medium';
  } else {
    return 'low';
  }
};

/**
 * Convert Apple Reminder to App Task
 */
const convertReminderToTask = (reminder: AppleReminder): Task => {
  return {
    id: reminder.id,
    title: reminder.title,
    description: '',
    status: reminder.completed ? 'done' : 'todo',
    priority: convertPriority(reminder.priority),
    dueDate: reminder.dueDate ? new Date(reminder.dueDate) : undefined,
    tags: reminder.listTitle ? [reminder.listTitle] : [],
    createdAt: new Date(reminder.createdAt),
    updatedAt: new Date(reminder.modifiedAt),
    completedAt: reminder.completionDate ? new Date(reminder.completionDate) : undefined,
    completed: reminder.completed,
    notes: reminder.notes,
  };
};

export const appleRemindersService = {
  /**
   * Check if running on iOS
   */
  isIOS(): boolean {
    return Capacitor.getPlatform() === 'ios';
  },

  /**
   * Check if we have permission to access reminders
   */
  async checkPermissions(): Promise<boolean> {
    // Only available on iOS
    if (!this.isIOS()) {
      return false;
    }

    try {
      const result = await AppleReminders.checkRemindersPermissions();
      return result.granted;
    } catch (error: any) {
      console.error(
        'Error checking reminders permissions:',
        error?.message || error?.code || error
      );
      return false;
    }
  },

  /**
   * Request permission to access reminders
   */
  async requestPermissions(): Promise<boolean> {
    // Only available on iOS
    if (!this.isIOS()) {
      return false;
    }

    try {
      const result = await AppleReminders.requestRemindersPermissions();
      return result.granted;
    } catch (error: any) {
      console.error(
        'Error requesting reminders permissions:',
        error?.message || error?.code || error
      );
      return false;
    }
  },

  /**
   * Fetch tasks from Apple Reminders
   */
  async getTasks(includeCompleted: boolean = false): Promise<Task[]> {
    // Only available on iOS
    if (!this.isIOS()) {
      return [];
    }

    try {
      // Check if we have permission
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        // Request permission
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Permission denied to access reminders');
        }
      }

      // Fetch reminders
      const result = await AppleReminders.getReminders({ includeCompleted });
      const tasks = result.reminders.map(convertReminderToTask);

      // Additional client-side filtering to ensure completed tasks are excluded
      if (!includeCompleted) {
        return tasks.filter((task) => !task.completed && task.status !== 'done');
      }

      return tasks;
    } catch (error: any) {
      console.error('Error fetching reminders:', error?.message || error?.code || error);
      throw error;
    }
  },

  /**
   * Get reminder lists
   */
  async getReminderLists(): Promise<Array<{ id: string; title: string }>> {
    // Only available on iOS
    if (!this.isIOS()) {
      return [];
    }

    try {
      const result = await AppleReminders.getReminderLists();
      return result.lists;
    } catch (error: any) {
      console.error('Error fetching reminder lists:', error?.message || error?.code || error);
      return [];
    }
  },
};
