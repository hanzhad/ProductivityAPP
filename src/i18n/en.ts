export const en = {
  app: {
    title: '📅 Calendar & Reminders',
  },
  errors: {
    loadingEvents: 'Failed to load calendar events',
    loadingTasks: 'Failed to load reminders',
    googleApiInit: 'Failed to initialize Google API',
    googleSignIn: 'Failed to sign in with Google',
    appleRemindersAccess: 'Unable to access Apple Reminders. Please grant permission in Settings.',
  },
  calendar: {
    loadingEvents: 'Loading events...',
    noEventsScheduled: 'No events scheduled',
  },
  tasks: {
    title: '🔔 Reminders',
    noTasks: '📭 No reminders',
    loadingTasks: 'Loading reminders...',
    priority: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    demoTask1Title: 'Complete project',
    demoTask1Notes: 'Important reminder with deadline',
    demoTask2Title: 'Buy groceries',
    demoTask3Title: 'Call doctor',
    demoTask4Title: 'Prepare presentation',
  },
  language: {
    en: 'English',
    uk: 'Українська',
    ru: 'Русский',
  },
  auth: {
    initializing: 'Initializing Google API...',
    signInPrompt: 'Please sign in with your Google account to access calendar and reminders',
    signedInAs: 'Signed in as',
    signInWithGoogle: 'Sign in with Google',
    signOut: 'Sign Out',
  },
};

export type Translation = typeof en;
