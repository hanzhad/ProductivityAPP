export interface AppleReminder {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  completionDate?: string;
  completed: boolean;
  priority: number; // 0 = none, 1-4 = high, 5 = medium, 6-9 = low
  listId?: string;
  listTitle?: string;
  createdAt: string;
  modifiedAt: string;
}

export interface AppleRemindersPlugin {
  /**
   * Check if reminders permission is granted
   */
  checkRemindersPermissions(): Promise<{ granted: boolean }>;

  /**
   * Request permission to access reminders
   */
  requestRemindersPermissions(): Promise<{ granted: boolean }>;

  /**
   * Fetch all reminders from the user's account
   */
  getReminders(options?: { includeCompleted?: boolean }): Promise<{ reminders: AppleReminder[] }>;

  /**
   * Get reminder lists
   */
  getReminderLists(): Promise<{ lists: Array<{ id: string; title: string }> }>;
}
