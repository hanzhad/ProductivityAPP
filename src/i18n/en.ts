export const en = {
  app: {
    title: '📅 Calendar & Reminders',
  },
  tabs: {
    calendar: '📅 Calendar',
    notes: '📝 Notes',
    tasks: '🔔 Reminders',
  },
  common: {
    loading: 'Loading...',
    refresh: '🔄 Refresh',
    refreshing: '⟳ Loading...',
    retry: 'Retry',
    all: 'All',
    active: 'Active',
    completed: 'Completed',
    yes: 'Yes',
    no: 'No',
  },
  errors: {
    permissionsRequired: 'Calendar and notes access required',
    loadingEvents: 'Failed to load calendar events',
    loadingNotes: 'Failed to load notes',
    loadingTasks: 'Failed to load reminders',
    requestingPermissions: 'Error requesting permissions',
    googleApiInit: 'Failed to initialize Google API',
    googleSignIn: 'Failed to sign in with Google',
    googleSignOut: 'Failed to sign out',
    appleRemindersAccess: 'Unable to access Apple Reminders. Please grant permission in Settings.',
  },
  alerts: {
    appleNotesPlugin: 'ℹ️ Full integration with Apple Notes requires a native plugin',
    appleRemindersPlugin: 'ℹ️ Full integration with Apple Reminders requires a native plugin',
  },
  calendar: {
    title: '📅 Calendar Events',
    noEvents: '📭 No upcoming events',
    loadingEvents: 'Loading events...',
  },
  notes: {
    title: '📝 Notes',
    noNotes: '📭 No notes',
    loadingNotes: 'Loading notes...',
    demoNote1Title: 'Important Note',
    demoNote1Content:
      'This is a demo note. Full integration with Apple Notes requires creating a native plugin.',
    demoNote2Title: 'Shopping List',
    demoNote2Content: 'Milk\nBread\nEggs\nFruits',
    demoNote3Title: 'Project Ideas',
    demoNote3Content: 'Add dark theme\nOptimize performance\nWrite tests',
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
    select: 'Language',
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
