import { NextResponse } from "next/server";
import { adminMessaging } from "@/lib/panjika/firebase-admin";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Subscribe this specific phone to the daily broadcast
    await adminMessaging.subscribeToTopic([token], "daily_panjika");
    
    return NextResponse.json({ success: true, message: "Subscribed to daily_panjika" });
  } catch (error: any) {
    console.error("Subscription error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}