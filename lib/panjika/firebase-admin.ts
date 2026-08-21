import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// 1. Safely check if environment variables exist
const hasEnvVars = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY;

// 2. Only initialize if apps aren't loaded AND we have the keys
if (!getApps().length && hasEnvVars) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

// 3. Only export messaging if an app successfully initialized
// (This prevents the 'app/no-app' crash during Vercel builds)
export const adminMessaging = getApps().length ? getMessaging() : null;