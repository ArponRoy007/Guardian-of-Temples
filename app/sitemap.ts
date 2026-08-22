import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://guardianoftemples.online";

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
    const supabase = createClient();
    const { data: temples } = await supabase
      .from("temples")
      .select("id, updated_at");

    const templePages: MetadataRoute.Sitemap = (temples || []).map((temple) => ({
      url: `${baseUrl}/temple/${temple.id}`,
      lastModified: temple.updated_at ? new Date(temple.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...templePages];
  } catch (error) {
    console.error("Error generating dynamic sitemap from Supabase:", error);
    return staticPages;
  }
}