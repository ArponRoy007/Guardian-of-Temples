<div align="center">

  <img src="public/favicon.svg" width="90" alt="Guardian of Temples Logo" />

  # Guardian of Temples
  ### *Protecting Sacred Spaces, Informing Safe Journeys*

  A mobile-first incident visualization and safety portal mapping incidents affecting Hindu temples across Bangladesh during Durga Puja.

  [![Next.js](https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4_Styling-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

</div>

---

## 🏛️ About the Project

**Guardian of Temples** is a crisis mapping and safety platform designed to document, verify, and visualize incidents affecting sacred sites in Bangladesh's 64 districts. Built during heightened vulnerabilities around major festival periods such as Durga Puja, the application assists devotees in planning safe journeys while equipping community leaders, journalists, and law enforcement with empirical data and verified audit trails.

The application combines public reporting, multi-tier moderation workflows, organic dataset expansion using PostgreSQL fuzzy matching, and rapid tap-to-call emergency helplines.

---

## ✨ Key Features

- 🗺️ **Interactive District Choropleth Map**: Real-time incident density map of all 64 Bangladesh districts featuring custom SVG rendering, safety level assessments, and district detail panels.
- 📥 **CSV Bulk Temple Import Engine**: Powerful admin tooling to import thousands of verified temple records from CSV files with automatic `name + district_id` duplicate suppression.
- 🌱 **Organic Temple Auto-Creation**: Uses PostgreSQL `pg_trgm` trigram similarity matching to link incident reports to existing temples or auto-create unverified temple records when users report new sites.
- 📞 **Tap-to-Call Emergency Helpline Portal**: Instant public access to national emergency hotlines (999, Police Control Room, Legal Aid, Human Rights Commission) with mobile `tel:` links and district filtering.
- 🛡️ **Role-Based Moderation & Admin Control Center**: Multi-tier security (`user`, `moderator`, `admin`) protecting verification queues, audit logs, temple CRUD managers, and administrative status overrides.
- 📱 **Mobile-First App Architecture**: Built for phone viewports with a 5-target bottom navigation bar (`MobileBottomNav`), safe-area inset support, and dark/light theme switching.

---

## 🛠️ Tech Stack

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router, TypeScript) | React framework with Server Components & Server Actions |
| **Styling** | Tailwind CSS + `next-themes` | Glassmorphism UI design system & dark/light mode toggle |
| **Database** | PostgreSQL + Supabase DB | Relational database with `pg_trgm` fuzzy similarity search |
| **Authentication** | Supabase Auth (`@supabase/ssr`) | Cookie-based session handling with Row-Level Security (RLS) |
| **Storage** | Supabase Storage | Public bucket storage for uploaded incident photo evidence |
| **Icons** | Lucide React | Modern geometric UI icons |

---

## 🚀 Getting Started

Follow these steps to set up **Guardian of Temples** locally:

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **yarn** / **pnpm**
- A **Supabase** project instance

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/your-username/guardian-of-temples.git
cd guardian-of-temples
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Database Migrations
Apply the PostgreSQL migration files located in `supabase/migrations/` sequentially via your Supabase SQL Editor:
1. `001_initial_schema.sql`
2. `002_rls_policies.sql`
3. `003_incident_counts_view.sql`
4. `004_add_temple_name_raw_and_storage.sql`
5. `005_admin_features.sql`
6. `006_temple_auto_add.sql`
7. `007_seed_helplines.sql`

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Database Seeding via CLI

You can seed thousands of official temple records directly from a local CSV file using the standalone TypeScript seed script:

```bash
# Seed official temple list from CSV using tsx
npx tsx scripts/import-temples.ts public/data/temples_import_template.csv
```

The CLI script automatically normalizes district names, checks for existing records, suppresses duplicate entries, and outputs an import summary table to the console.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with care for public safety and sacred heritage preservation in Bangladesh.</sub>
</div>
