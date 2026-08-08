"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createPostSchema = z.object({
  imageUrl: z.string({ required_error: "An image photo is required for your post." }).url("Invalid image URL."),
  cloudinaryPublicId: z.string({ required_error: "Cloudinary asset ID is required." }).min(1),
  caption: z
    .string()
    .max(500, "Caption cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export async function createTemplePostAction(inputData: CreatePostInput) {
  try {
    // 1. Validate payload server-side
    const validatedData = createPostSchema.parse(inputData);

    // 2. Server-side Authentication & Role Verification
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "Authentication required. Please sign in to create a post." };
    }

    // 3. AIRTIGHT SECURITY BOUNDARY: Fetch profile server-side & verify temple_admin role + linked_temple_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, linked_temple_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { error: "User profile not found." };
    }

    if (profile.role !== "temple_admin" || !profile.linked_temple_id) {
      return {
        error:
          "Access denied. You must be a verified Temple Admin linked to a temple to publish posts.",
      };
    }

    // Always use the server-verified linked_temple_id as temple_id
    const serverVerifiedTempleId = profile.linked_temple_id;

    // 4. Insert post into temple_posts table (posts go live immediately: is_deleted = false)
    const { data: newPost, error: insertError } = await supabase
      .from("temple_posts")
      .insert({
        temple_id: serverVerifiedTempleId,
        created_by: user.id,
        image_url: validatedData.imageUrl,
        cloudinary_public_id: validatedData.cloudinaryPublicId,
        caption: validatedData.caption?.trim() || null,
        is_deleted: false,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Temple post insert error:", insertError.message);
      return { error: insertError.message || "Failed to publish temple post." };
    }

    // 5. Revalidate relevant path caches
    revalidatePath("/");
    revalidatePath("/search");
    revalidatePath(`/temple/${serverVerifiedTempleId}`);
    revalidatePath("/temple-feed/new-post");

    return {
      success: true,
      postId: newPost.id,
      templeId: serverVerifiedTempleId,
      message: "Your post is now live on the Temple Feed!",
    };
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return { error: err.errors[0]?.message || "Validation failed." };
    }
    console.error("Temple post creation action exception:", err);
    return { error: "An unexpected error occurred while publishing your post." };
  }
}
