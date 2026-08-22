import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export const alt = "Guardian of Temples - Dynamic Profile Preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { templeId: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUuid = UUID_REGEX.test(params.templeId);

  let templeName = "Temple Profile";
  let districtName = "Bangladesh";
  let isVerified = false;

  const query = supabase
    .from("temples")
    .select("name, is_verified, districts(name_en)");

  const { data: temple } = isUuid
    ? await query.eq("id", params.templeId).maybeSingle()
    : await query.eq("slug", params.templeId).maybeSingle();

  if (temple) {
    templeName = temple.name;
    districtName = (temple.districts as any)?.name_en || "Bangladesh";
    isVerified = temple.is_verified || false;
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          padding: "60px",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Header Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "rgba(249, 115, 22, 0.15)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f97316",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            🛕
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#f97316",
            }}
          >
            Guardian of Temples
          </span>
        </div>

        {/* Center Main Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isVerified && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                color: "#10b981",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "16px",
                fontWeight: 700,
                width: "fit-content",
              }}
            >
              ✓ Official Verified Temple
            </div>
          )}

          <h1
            style={{
              fontSize: "56px",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              color: "#ffffff",
              maxWidth: "1000px",
            }}
          >
            {templeName}
          </h1>

          <p style={{ fontSize: "28px", color: "#94a3b8", margin: 0 }}>
            📍 {districtName} District, Bangladesh
          </p>
        </div>

        {/* Footer Brand Callout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid #1e293b",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "18px", color: "#64748b" }}>
            Community Feed • Live Updates • Verified Safety Info
          </span>
          <span style={{ fontSize: "18px", fontWeight: 700, color: "#f97316" }}>
            guardianoftemples.online
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
