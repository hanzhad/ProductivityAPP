import { createStore } from 'solid-js/store';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

export interface NotificationSettings {
  enabled: boolean;
  taskReminders: boolean;
  eventReminders: boolean;
  reminderMinutes: number;
  sound: boolean;
}

export interface DisplaySettings {
  theme: Theme;
  compactMode: boolean;
  showCompletedTasks: boolean;
  showArchivedNotes: boolean;
  defaultView: 'calendar' | 'tasks' | 'notes' | 'dashboard';
}

export interface LocalizationSettings {
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  timezone: string;
}

export interface SyncSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  lastSyncAt?: Date;
  cloudProvider?: 'google' | 'icloud' | 'dropbox';
}

export interface PrivacySettings {
  analytics: boolean;
  crashReports: boolean;
  biometricAuth: boolean;
  requirePassword: boolean;
}

interface SettingsState {
  display: DisplaySettings;
  localization: LocalizationSettings;
  notifications: NotificationSettings;
  sync: SyncSettings;
  privacy: PrivacySettings;
  loading: boolean;
  error: string;
}

const defaultSettings: SettingsState = {
  display: {
    theme: 'system',
    compactMode: false,
    showCompletedTasks: true,
    showArchivedNotes: false,
    defaultView: 'dashboard',
  },
  localization: {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 0,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  notifications: {
    enabled: true,
    taskReminders: true,
    eventReminders: true,
    reminderMinutes: 15,
    sound: true,
  },
  sync: {
    autoSync: false,
    syncInterval: 30,
  },
  privacy: {
    analytics: false,
    crashReports: true,
    biometricAuth: false,
    requirePassword: false,
  },
  loading: false,
  error: '',
};

const [settingsStore, setSettingsStore] = createStore<SettingsState>(defaultSettings);

export const useSettingsStore = () => {
  const setLoading = (loading: boolean) => {
    setSettingsStore('loading', loading);
  };

  const setError = (error: string) => {
    setSettingsStore('error', error);
  };

  // Display settings
  const setTheme = (theme: Theme) => {
    setSettingsStore('display', 'theme', theme);
  };

  const setCompactMode = (enabled: boolean) => {
    setSettingsStore('display', 'compactMode', enabled);
  };

  const setShowCompletedTasks = (show: boolean) => {
    setSettingsStore('display', 'showCompletedTasks', show);
  };

  const setShowArchivedNotes = (show: boolean) => {
    setSettingsStore('display', 'showArchivedNotes', show);
  };

  const setDefaultView = (view: DisplaySettings['defaultView']) => {
    setSettingsStore('display', 'defaultView', view);
  };

  const updateDisplaySettings = (settings: Partial<DisplaySettings>) => {
    setSettingsStore('display', settings);
  };

  // Localization settings
  const setLanguage = (language: Language) => {
    setSettingsStore('localization', 'language', language);
  };

  const setDateFormat = (format: DateFormat) => {
    setSettingsStore('localization', 'dateFormat', format);
  };

  const setTimeFormat = (format: TimeFormat) => {
    setSettingsStore('localization', 'timeFormat', format);
  };

  const setFirstDayOfWeek = (day: 0 | 1) => {
    setSettingsStore('localization', 'firstDayOfWeek', day);
  };

  const setTimezone = (timezone: string) => {
    setSettingsStore('localization', 'timezone', timezone);
  };

  const updateLocalizationSettings = (settings: Partial<LocalizationSettings>) => {
    setSettingsStore('localization', settings);
  };

  // Notification settings
  const setNotificationsEnabled = (enabled: boolean) => {
    setSettingsStore('notifications', 'enabled', enabled);
  };

  const setTaskReminders = (enabled: boolean) => {
    setSettingsStore('notifications', 'taskReminders', enabled);
  };

  const setEventReminders = (enabled: boolean) => {
    setSettingsStore('notifications', 'eventReminders', enabled);
  };

  const setReminderMinutes = (minutes: number) => {
    setSettingsStore('notifications', 'reminderMinutes', minutes);
  };

  const setNotificationSound = (enabled: boolean) => {
    setSettingsStore('notifications', 'sound', enabled);
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setSettingsStore('notifications', settings);
  };

  // Sync settings
  const setAutoSync = (enabled: boolean) => {
    setSettingsStore('sync', 'autoSync', enabled);
  };

  const setSyncInterval = (minutes: number) => {
    setSettingsStore('sync', 'syncInterval', minutes);
  };

  const setLastSyncAt = (date: Date) => {
    setSettingsStore('sync', 'lastSyncAt', date);
  };

  const setCloudProvider = (provider?: SyncSettings['cloudProvider']) => {
    setSettingsStore('sync', 'cloudProvider', provider);
  };

  const updateSyncSettings = (settings: Partial<SyncSettings>) => {
    setSettingsStore('sync', settings);
  };

  // Privacy settings
  const setAnalytics = (enabled: boolean) => {
    setSettingsStore('privacy', 'analytics', enabled);
  };

  const setCrashReports = (enabled: boolean) => {
    setSettingsStore('privacy', 'crashReports', enabled);
  };

  const setBiometricAuth = (enabled: boolean) => {
    setSettingsStore('privacy', 'biometricAuth', enabled);
  };

  const setRequirePassword = (enabled: boolean) => {
    setSettingsStore('privacy', 'requirePassword', enabled);
  };

  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    setSettingsStore('privacy', settings);
  };

  // General
  const resetToDefaults = () => {
    setSettingsStore(defaultSettings);
  };

  const importSettings = (settings: Partial<SettingsState>) => {
    setSettingsStore(settings);
  };

  const exportSettings = () => {
    return { ...settingsStore };
  };

  return {
    store: settingsStore,
    setLoading,
    setError,
    // Display
    setTheme,
    setCompactMode,
    setShowCompletedTasks,
    setShowArchivedNotes,
    setDefaultView,
    updateDisplaySettings,
    // Localization
    setLanguage,
    setDateFormat,
    setTimeFormat,
    setFirstDayOfWeek,
    setTimezone,
    updateLocalizationSettings,
    // Notifications
    setNotificationsEnabled,
    setTaskReminders,
    setEventReminders,
    setReminderMinutes,
    setNotificationSound,
    updateNotificationSettings,
    // Sync
    setAutoSync,
    setSyncInterval,
    setLastSyncAt,
    setCloudProvider,
    updateSyncSettings,
    // Privacy
    setAnalytics,
    setCrashReports,
    setBiometricAuth,
    setRequirePassword,
    updatePrivacySettings,
    // General
    resetToDefaults,
    importSettings,
    exportSettings,
  };
};
