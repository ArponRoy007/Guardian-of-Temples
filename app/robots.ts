import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/moderator",
        "/submit-incident",
        "/temple-feed/new-post",
        "/profile",
        "/notifications",
      ],
    },
    sitemap: "https://guardianoftemples.online/sitemap.xml",
  };
}