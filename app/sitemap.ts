import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://guardianoftemples.online";

  // Use the standard client (no cookies) to prevent Next.js dynamic server build errors!
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Core Static & Pillar Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/safety-map`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/panjika`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/heritage`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  try {
    // 1. Fetch Temples
    const { data: temples } = await supabase
      .from("temples")
      .select("id, updated_at");

    const templePages: MetadataRoute.Sitemap = (temples || []).map((temple) => ({
      url: `${baseUrl}/temple/${temple.id}`,
      lastModified: temple.updated_at ? new Date(temple.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // 2. Fetch Festivals (NEW SEO ADDITION)
    const { data: festivals } = await supabase
      .from("festivals")
      .select("slug");

    const festivalPages: MetadataRoute.Sitemap = (festivals || []).map((festival) => ({
      url: `${baseUrl}/festivals/${festival.slug}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.9,
    }));

    // 3. Fetch Districts (NEW SEO ADDITION)
    const { data: districts } = await supabase
      .from("districts")
      .select("id");

    const districtPages: MetadataRoute.Sitemap = (districts || []).map((district) => ({
      url: `${baseUrl}/district/${district.id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    // Combine them all!
    return [...staticPages, ...festivalPages, ...districtPages, ...templePages];
  } catch (error) {
    console.error("Error generating dynamic sitemap from Supabase:", error);
    return staticPages;
  }
}