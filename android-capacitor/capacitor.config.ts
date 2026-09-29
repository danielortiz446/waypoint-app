import type { CapacitorConfig } from '@capacitor/cli';
// DEVELOPMENT WRAPPER ONLY. For Play Store distribution, bundle app assets and audit offline support.
const remoteUrl=(process.env.WAYPOINT_ANDROID_URL||'').trim().replace(/\/$/,'');
if(!/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(remoteUrl)) throw new Error('WAYPOINT_ANDROID_URL must be your real HTTPS Railway domain');
const config:CapacitorConfig={appId:'com.waypoint.travelplanner',appName:'Waypoint',webDir:'www',server:{url:remoteUrl,cleartext:false,allowNavigation:[new URL(remoteUrl).hostname]}};
export default config;
