import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.guardian.temples',
  appName: 'Guardian of Temples',
  webDir: 'public',
  server: {
    url: 'https://guardianoftemples.online',
    cleartext: false
  }
};

export default config;