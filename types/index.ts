export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type VerificationStatus = "pending" | "verified" | "rejected" | "disputed";

export type IncidentCategory =
  | "temple_vandalism"
  | "idol_destruction"
  | "arson"
  | "physical_assault"
  | "land_encroachment"
  | "threat_harassment"
  | "other";

export interface District {
  id: string;
  name: string;
  bnName: string;
  division: string;
  totalIncidents: number;
  criticalIncidents: number;
  latitude: number;
  longitude: number;
}

export interface Temple {
  id: string;
  name: string;
  bnName?: string;
  districtId: string;
  districtName: string;
  address: string;
  latitude?: number;
  longitude?: number;
  establishedYear?: string;
}

export interface IncidentMedia {
  id: string;
  incidentId: string;
  url: string;
  mediaType: "image" | "video" | "document";
  caption?: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: VerificationStatus;
  district: string;
  upazila?: string;
  villageOrLocation: string;
  templeName?: string;
  incidentDate: string; // ISO date string
  reportedAt: string;
  verifiedAt?: string;
  latitude?: number;
  longitude?: number;
  sourceUrl?: string;
  verifiedBy?: string;
  media?: IncidentMedia[];
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  role: "user" | "temple_admin" | "moderator" | "admin" | "verifier" | "reporter";
  linked_temple_id?: string | null;
  created_at?: string;
}
