import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

// 01. Check if an app is already initialized
if (!getApps().length) {
  try {
    // 02. Initialize with specific credentials
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID as string,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") as string,
      }),
    });
  } catch (error) {
    console.error("Firebase admin initialization error:", error);
  }
}

// 03. Export the messaging module
export const adminMessaging = getMessaging();