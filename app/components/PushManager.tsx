"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

export default function PushManager() {
  useEffect(() => {
    // Only run this if the user is actually inside the Android APK!
    if (Capacitor.isNativePlatform()) {
      setupPushNotifications();
    }
  }, []);

  const setupPushNotifications = async () => {
    try {
      // 1. Request permission from the user
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        console.log("User denied push notification permission");
        return;
      }

      // 2. Register the device with Google
      await PushNotifications.register();

      // 3. Listen for the token and send it to our backend to subscribe
      PushNotifications.addListener('registration', async (token) => {
        console.log("Push registration success, token:", token.value);
        
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.value }),
        });
      });

    } catch (error) {
      console.error("Error setting up push notifications:", error);
    }
  };

  // This component doesn't render any UI
  return null;
}