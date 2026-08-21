import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guardian.temples',
  appName: 'GoTapp', // <-- This changes the name under your app icon!
  webDir: 'public',
  server: {
    url: 'https://guardianoftemples.online',
    cleartext: false,
    allowNavigation: [
      'guardianoftemples.online',
      '*.guardianoftemples.online'
    ]
  }
};

export default config;