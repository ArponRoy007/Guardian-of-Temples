import { Metadata } from "next";
import Link from "next/link";
import { Landmark, ShieldAlert, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Hindu Temple Architecture & Heritage Conservation in Bangladesh",
  description:
    "Explore the terracotta temples, architectural styles, and conservation challenges of Bangladesh's Hindu heritage sites — and how communities are working to preserve them.",
  keywords: [
    "Hindu temple architecture Bangladesh",
    "terracotta temples Bengal",
    "Kantajew Temple Dinajpur",
    "Puthia Temple Complex Rajshahi",
    "heritage conservation Bangladesh",
    "ancient Hindu temples in Bangladesh",
    "বাংলাদেশের হিন্দু মন্দির স্থাপত্য",
  ],
  openGraph: {
    title: "Hindu Temple Architecture & Heritage Conservation in Bangladesh",
    description:
      "Explore the terracotta temples, architectural styles, and conservation challenges of Bangladesh's Hindu heritage sites.",
    url: "https://guardianoftemples.online/heritage/architecture",
    type: "article",
  },
};

export default function ArchitecturePage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <article className="prose prose-slate dark:prose-invert lg:prose-lg mx-auto">
        
        {/* PAGE HEADER */}
        <header className="mb-10 text-center border-b border-slate-200 dark:border-slate-800 pb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-4">
            Hindu Temple Architecture & Heritage Conservation in Bangladesh
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            A guide to the terracotta temples, regional architectural styles, and the ongoing effort required to preserve Bengal's Hindu heritage.
          </p>
        </header>

        {/* CONTENT BODY */}
        <section className="space-y-8 text-slate-800 dark:text-slate-200 leading-relaxed">
          <p>
            Long before Bangladesh had a name, the deltaic plains of Bengal were producing some of the most distinctive temple architecture found anywhere in South Asia. Built from fired clay rather than the stone more commonly associated with Indian temple traditions, these structures reflect the region's geography as much as its faith — and today, many stand as fragile, irreplaceable witnesses to centuries of continuous worship and craftsmanship.
          </p>
          <p>
            This guide explores the architectural traditions behind Bangladesh's Hindu temples, why they look the way they do, and the ongoing effort required to keep them standing for future generations.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 flex items-center">
            <Landmark className="mr-3 h-6 w-6 text-primary-500" />
            Why Bengal's Temples Look Different
          </h2>
          <p>
            Most of South Asia's most famous temple architecture — the towering <em>shikharas</em> of Odisha, the <em>gopurams</em> of Tamil Nadu — is built from stone. Bengal had almost none of it. The region's alluvial delta, formed by the Ganges, Brahmaputra, and Meghna river systems, is defined by soft, fertile soil rather than stone quarries. Builders adapted to what the land actually offered: <strong>clay</strong>.
          </p>
          <p>
            This single geographic fact shaped Bengal's entire temple-building tradition. Instead of carved stone, artisans developed extraordinary skill in <strong>terracotta</strong> — fired clay brick and tile, often carved or molded with intricate relief work depicting deities, mythological scenes, floral motifs, and even everyday rural life. What Bengal's temples lack in stone monumentality, they make up for in a density and intimacy of decorative detail rarely matched elsewhere.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4">Key Architectural Styles</h2>
          
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">The Chala (Roof-Style) Temples</h3>
          <p>
            One of Bengal's most distinctive contributions to temple architecture is the <strong>chala</strong> roof form — a curved, sloping roof style directly borrowed from the region's traditional thatched-roof rural huts, then reimagined in brick and terracotta. Common variations include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Do-chala:</strong> Two-sloped roof</li>
            <li><strong>Char-chala:</strong> Four-sloped, pyramidal roof</li>
            <li><strong>Aat-chala:</strong> Eight-sloped, a two-tier variation of the char-chala</li>
          </ul>
          <p>
            This translation of humble, everyday vernacular architecture into sacred monumental form is considered one of Bengal's most original architectural contributions — a temple style found almost nowhere else in the subcontinent in quite the same way.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">The Ratna (Pinnacled) Temples</h3>
          <p>
            From the 17th century onward, Bengal developed the <strong>ratna</strong> style — temples topped with one, five, or nine small pinnacle towers (<em>ek-ratna, pancha-ratna, nava-ratna</em>). These structures combine the chala roofline at the base with towering, temple-like spires above, creating a visually striking hybrid form that became especially popular among wealthy patrons commissioning temples during the 17th and 18th centuries.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">Terracotta Ornamentation</h3>
          <p>
            Regardless of overall structural form, it is the surface decoration that defines Bengal's temple tradition most distinctively. Skilled artisans covered exterior walls with panels of carved or molded terracotta tile depicting:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Scenes from the Ramayana and Mahabharata</li>
            <li>Depictions of Krishna Leela (the life of Krishna)</li>
            <li>Floral and geometric patterning</li>
            <li>Scenes of contemporary daily life, hunting, and even colonial-era ships and soldiers — offering historians a rare visual record of the period, preserved directly on sacred architecture</li>
          </ul>
          <p>
            The <strong>Kantajew Temple</strong> in <Link href="/district/dinajpur" className="text-primary-500 hover:underline">Dinajpur</Link> is widely considered one of the finest surviving examples of this tradition anywhere in Bengal, with its walls covered almost entirely in detailed terracotta panelwork. The temple complex at <strong>Puthia</strong>, in <Link href="/district/rajshahi" className="text-primary-500 hover:underline">Rajshahi</Link>, similarly represents one of the largest concentrations of historic temple architecture in the country, with multiple structures spanning different styles and centuries standing within a single complex.
          </p>

          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-2">A Living Tradition, Not Just a Historical One</h3>
          <p>
            It's worth noting that this architectural language didn't stop developing after some distant golden age — many of Bangladesh's temples were built, rebuilt, or renovated across the 18th, 19th, and even 20th centuries, with local artisans continuing to adapt these traditional forms. This makes Bengal's temple architecture a genuinely continuous tradition, not simply a set of preserved relics from a fixed historical period.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-10 mb-4 flex items-center">
            <ShieldAlert className="mr-3 h-6 w-6 text-orange-500" />
            The Conservation Challenge
          </h2>
          <p>
            Preserving these structures is significantly harder than it might appear, for reasons specific to how and where they were built.
          </p>
          <ul className="list-disc pl-6 space-y-4 mb-8">
            <li>
              <strong>The material itself is fragile.</strong> Terracotta and unreinforced brick are far more vulnerable to weathering, moisture, and structural stress than carved stone. Bangladesh's climate — heavy monsoon rainfall, high humidity, and a subtropical growing season that encourages vegetation to take root in cracks and joints — accelerates deterioration considerably faster than in drier regions.
            </li>
            <li>
              <strong>Many sites lack formal protection or funding.</strong> While a handful of major temple complexes have received some degree of government heritage recognition, a large number of historically and architecturally significant temples across Bangladesh have no formal conservation status at all. Their preservation depends almost entirely on the resources and dedication of local temple committees — often with minimal outside support.
            </li>
            <li>
              <strong>Urbanization and land pressure.</strong> As towns and cities across Bangladesh grow, older temple sites can face encroachment, neglect in favor of newer construction, or simple lack of visibility to potential preservation resources and donors, especially diaspora communities who may not know a site's condition or needs.
            </li>
            <li>
              <strong>Documentation gaps.</strong> Perhaps the most solvable problem is also one of the most persistent: many temples, particularly smaller rural sites, have never been comprehensively photographed, mapped, or historically documented in any centralized, accessible way. A temple that isn't documented is a temple that's much harder to advocate for, fund, or protect.
            </li>
          </ul>

          <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 mt-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
              <BookOpen className="mr-3 h-5 w-5 text-primary-500" />
              How Documentation Supports Preservation
            </h2>
            <p className="mb-4">
              This last point is where community-driven platforms can make a genuine, practical difference. A well-documented temple — with verified location data, photographs, historical notes, and an active connection to its local committee — is easier to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-6">
              <li>Include in academic and heritage research</li>
              <li>Present to potential conservation donors, including diaspora organizations</li>
              <li>Protect through public visibility and community awareness</li>
              <li>Pass on accurately to future generations, rather than relying on fading oral memory</li>
            </ul>
            <p className="mb-6 font-medium">
              Guardian of Temples was built with this in mind. Every temple on the platform is tied to a verified location and, where possible, a real connection to its local committee — creating a living, growing record rather than a static list that goes out of date.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/become-temple-admin" className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Register & document your temple
              </Link>
              <Link href="/safety-map" className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                Explore documented temples
              </Link>
            </div>
          </div>

          <p className="text-sm text-slate-500 mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <em>Guardian of Temples is a community platform documenting and connecting Hindu temples across Bangladesh. This guide draws on widely recognized architectural and historical scholarship on Bengal temple traditions. If you have historical knowledge about a specific temple's architecture or conservation status, we welcome your temple committee's contribution via our <Link href="/support" className="text-primary-500 hover:underline">contact page</Link>.</em>
          </p>

        </section>
      </article>
    </main>
  );
}