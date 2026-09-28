import type { CapacitorConfig } from '@capacitor/cli';

// For development/testing only. Set WAYPOINT_IOS_URL to your REAL
// HTTPS Railway/custom domain *before* running `npx cap sync ios`.
// No example domain is hardcoded into a release bundle.
const remoteUrl = (process.env.WAYPOINT_IOS_URL || '').trim().replace(/\/$/, '');
if (!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(remoteUrl)) {
  throw new Error('WAYPOINT_IOS_URL missing or invalid. Example: https://your-real-site.example');
}

const config: CapacitorConfig = {
  appId: 'com.waypoint.travelplanner', // CHANGE before distribution; must be unique in Apple Developer.
  appName: 'Waypoint',
  webDir: 'www',
  server: {
    url: remoteUrl,           // DEVELOPMENT WEB SHELL, not final App Store architecture
    cleartext: false,
    allowNavigation: [new URL(remoteUrl).hostname],
  },
  ios: { contentInset: 'automatic' },
};
export default config;
