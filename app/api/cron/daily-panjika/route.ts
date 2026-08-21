import { NextResponse } from "next/server";
import { generateDailyNotification } from "@/lib/panjika/notifications";
import { adminMessaging } from "@/lib/panjika/firebase-admin";

export async function GET(request: Request) {
  try {
    // Optional security check for Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (process.env.NODE_ENV === "production" && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Generate today's custom Bangla notification message
    const dailyNote = generateDailyNotification();

    // 2. Build the payload for Firebase
    const message = {
      notification: {
        title: dailyNote.title,
        body: dailyNote.message,
      },
      topic: "daily_panjika", // Targets all your APK users at once
    };

    // 3. Send via Firebase Cloud Messaging
    const response = await adminMessaging.send(message);

    return NextResponse.json({
      success: true,
      messageId: response,
      sentNotification: dailyNote,
    });
  } catch (error: any) {
    console.error("Cron notification error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}