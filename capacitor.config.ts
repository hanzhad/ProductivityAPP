import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calendar.tasks.app',
  appName: 'Calendar Tasks',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Calendar: {
      permissions: {
        ios: ['calendar'],
        android: ['READ_CALENDAR', 'WRITE_CALENDAR']
      }
    }
  }
};

export default config;
