<div align="center">

  <img src="public/favicon.svg" width="90" alt="Guardian of Temples Logo" />

  # Guardian of Temples

  ### *Celebrating festivals together, keeping our temples informed and safe.*

  A full-stack, mobile-first social + safety platform for Hindu temples across Bangladesh — combining a verified-community photo feed with a transparent, moderated incident-awareness map covering all 64 districts.

  [![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Postgres_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Pipeline-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

  [**Live Demo**](#) · [**Report an Issue**](#)

</div>

---

## 🏛️ About the Project

**Guardian of Temples** is a full-stack platform I designed and built end-to-end, serving two connected purposes:

1. **A community feed** where verified temple committees post daily photo updates and festival highlights — giving every temple in Bangladesh a public, trusted presence, much like a dedicated page for their community.
2. **A safety information layer** — an interactive map and search tool covering all 64 districts, built on a transparent, human-moderated pipeline for reporting and verifying temple-related incidents, so visitors can stay informed and authorities have access to organized, verified data.

The project models a real production system: four distinct user roles, a full moderation and audit pipeline, role-based access control enforced at both the application and database layer, and a media pipeline built for scale on a free-tier budget.

---

## ✨ Key Features

### Community & Content
- 📸 **Temple Feed** — a Facebook-style feed where verified Temple Admins post photo updates; visitors browse and react (🙏 ❤️ 🌺) with reactions-only engagement (no comments/shares) by design, keeping the space calm and low-moderation-risk.
- 🏛️ **Temple Profile Pages** — dynamic per-temple pages with cover info, post history, verification badge, and direct links into that temple's safety data.
- 🔔 **Real-time Notifications** — in-app notification system (DB-trigger-driven) alerting Temple Admins to moderation actions and verification decisions.

### Safety & Trust
- 🗺️ **Interactive District Choropleth Map** — custom SVG rendering of all 64 districts with a graduated color scale reflecting verified incident density, tap-to-expand detail panels, and district-level safety verdicts.
- 🔍 **Unified Search** — fuzzy search across districts and temples with live autocomplete, routing users to either safety data or a temple's public profile.
- 🌱 **Organic Dataset Growth** — new temples reported via incidents are auto-linked or auto-created using PostgreSQL `pg_trgm` trigram similarity matching, flagged `unverified` until admin review.
- 📞 **Emergency Helpline Directory** — tap-to-call access to national emergency numbers, filterable by district.

### Trust & Safety Infrastructure
- 🛡️ **Four-Tier Role System** — `user`, `temple_admin`, `moderator`, `admin`, each with distinct permissions enforced via Next.js middleware **and** Postgres Row-Level Security (defense in depth, not UI-only gating).
- ✅ **Verification Workflows** — a full request → review → approve/reject pipeline for both incident reports and Temple Admin identity claims, with required reasons on rejection and a permanent audit log.
- 🗑️ **Dual-Path Moderation** — Temple Admins can self-remove their own posts (no reason required); Moderators/Admins can take down any post with a mandatory, logged, notified reason — two intentionally separate code paths to prevent privilege overlap.
- 📊 **Admin Control Center** — dashboards for incident oversight, moderator activity auditing, temple CRUD + bulk CSV import, and full submission history.

### Platform Engineering
- 📱 **Mobile-First & PWA-Ready** — installable PWA with a native Android APK build, safe-area-aware layouts, and a role-aware bottom navigation bar.
- 🌗 **Dark / Light Mode** — theme-consistent across every route, including dynamically rendered content.
- 🖼️ **Cloudinary Media Pipeline** — signed, server-validated uploads (type/size enforced server-side) with automatic compression and format optimization for every image surface in the app.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router, TypeScript, Server Actions) | Full-stack React framework, server-first data flow |
| **Database** | PostgreSQL via Supabase | Relational schema with RLS, triggers, and `pg_trgm` fuzzy matching |
| **Auth** | Supabase Auth (`@supabase/ssr`) | Cookie-based sessions, role-based middleware guards |
| **Media** | Cloudinary | Signed uploads, auto-compression, format optimization |
| **Styling** | Tailwind CSS + `next-themes` | Design-token-driven UI, dark/light theming |
| **Icons** | Lucide React | Consistent iconography |
| **Hosting** | Vercel | CI/CD deployment |
| **Mobile** | PWA + Capacitor (Android APK) | Cross-platform distribution |

---

## 🧱 Architecture Highlights

*(Notes for reviewers on some of the more interesting engineering decisions in this project)*

- **Defense-in-depth authorization**: every privileged Server Action re-verifies the caller's role and ownership server-side — client-side role checks are treated as UX only, never as the security boundary. RLS policies independently enforce the same rules at the database layer.
- **Transactional integrity on multi-step approvals**: Temple Admin approval (which creates a temple record *and* updates a user's role *and* closes a request) is wrapped in a single transaction, with an explicit guard against double-approval race conditions.
- **Separation of moderation concerns**: self-deletion and moderator takedown are deliberately distinct code paths with different data trails (soft-delete only vs. soft-delete + audit log + notification), rather than one action gated by role checks — reducing the chance of a permissions bug crossing the two.
- **Cursor-based pagination** on the feed and notifications for performant infinite scroll, versus offset pagination which degrades at scale.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.17.0+`
- npm / yarn / pnpm
- A Supabase project
- A Cloudinary account (free tier)

### Setup

```bash
git clone https://github.com/your-username/guardian-of-temples.git
cd guardian-of-temples
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Run migrations sequentially from `supabase/migrations/` in the Supabase SQL Editor, then:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

### Seeding sample data

```bash
# Bulk-import official temple records from CSV
npx tsx scripts/import-temples.ts public/data/temples_import_template.csv

# Seed test accounts (dev/staging only — see script header)
npx tsx scripts/seed-test-users.ts
```

---

## 📂 Project Structure

app/
├── (auth)/ # Login, signup, password reset
├── temple-feed/ # Home feed + post creation
├── temple/[templeId]/ # Public temple profile pages
├── safety-map/ # District choropleth map
├── search/ # Unified district/temple search
├── submit-incident/ # Incident reporting flow
├── moderator/ # Moderator dashboard
├── admin/ # Admin control center
└── helpline/ # Emergency contacts
components/
├── feed/ # Post cards, reactions, moderation UI
├── map/ # Choropleth map + district panels
├── forms/ # Validated submission forms
└── ui/ # Shared design system components
lib/
├── supabase/ # Client/server Supabase instances
├── cloudinary/ # Upload utilities
└── queries/ # Reusable data-fetching logic

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.

---

<div align="center">
  <sub>Designed & built solo — a full-stack case study in role-based access control, moderation systems, and community platform design.</sub>
</div>