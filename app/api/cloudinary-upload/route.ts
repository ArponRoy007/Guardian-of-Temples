import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

// Configure Cloudinary server-side
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const ALLOWED_FOLDERS = [
  "incident-evidence",
  "temple-admin-requests",
  "temple-posts",
] as const;

type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

export async function POST(req: NextRequest) {
  try {
    // 1. Server-side Supabase Session Verification
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in to upload images." },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as AllowedFolder | null;

    // 3. Server-side Validation
    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        {
          error:
            "Invalid upload folder. Must be 'incident-evidence', 'temple-admin-requests', or 'temple-posts'.",
        },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Invalid file format (${file.type}). Only JPG, PNG, and WEBP images are allowed.`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.` },
        { status: 400 }
      );
    }

    // Check Cloudinary environment credentials
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary environment variables are missing.");
      return NextResponse.json(
        { error: "Server configuration error. Cloudinary credentials missing." },
        { status: 500 }
      );
    }

    // 4. Convert File to ArrayBuffer & Buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 5. Upload Stream to Cloudinary with Auto-Compression & Resizing Transformations
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `guardian-of-temples/${folder}`,
            allowed_formats: ["jpg", "jpeg", "png", "webp"],
            transformation: [
              { width: 1600, height: 1600, crop: "limit" }, // Resize max 1600px maintaining aspect ratio
              { quality: "auto:good" },                    // Automatic web compression
              { fetch_format: "auto" },                    // Deliver modern webp/avif depending on browser
            ],
          },
          (error, result) => {
            if (error || !result) {
              console.error("Cloudinary upload error:", error);
              return reject(error || new Error("Cloudinary returned empty result."));
            }
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        uploadStream.end(fileBuffer);
      }
    );

    return NextResponse.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (err: any) {
    console.error("Signed Cloudinary upload route exception:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during image upload." },
      { status: 500 }
    );
  }
}
