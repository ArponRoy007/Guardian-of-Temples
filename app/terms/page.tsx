import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary-500" />
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
      </div>
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Last updated: [Insert Date]
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          1. Acceptance of Terms
        </h2>
        <p>
          By accessing or using Guardian of Temples (the "Service"), you agree
          to be bound by these Terms of Service. If you do not agree, please do
          not use the Service.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          2. Eligibility
        </h2>
        <p>
          You must be at least 13 years old to create an account. By
          registering, you represent that the information you provide is
          accurate and that you have the legal capacity to agree to these Terms.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          3. Account Registration & Security
        </h2>
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. Notify us
          immediately of any unauthorized use.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          4. Nature of the Service
        </h2>
        <p>
          Guardian of Temples is a community platform with two purposes: (a)
          enabling verified temple committees to share updates, photos, and
          celebrations with the public, and (b) providing a transparent,
          community-sourced information resource on temple-related safety
          incidents across Bangladesh, intended to support public awareness and
          assist relevant authorities.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          5. Accurate Reporting
        </h2>
        <p>
          Users submitting incident reports must provide accurate, good-faith
          information to the best of their knowledge. Deliberately submitting
          false, fabricated, exaggerated, or misleading reports is strictly
          prohibited and will result in content removal and may result in
          permanent account suspension.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          6. Content Moderation
        </h2>
        <p>
          All incident reports are reviewed by trained moderators before public
          display. Temple posts are published immediately but remain subject to
          removal by moderators or administrators if found to violate these
          Terms, with the responsible Temple Admin notified of the reason. We
          reserve the right, at our sole discretion, to review, edit, or remove
          any content submitted to the Service.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          7. Temple Admin Verification
        </h2>
        <p>
          Users requesting Temple Admin status must provide accurate identifying
          information and supporting evidence of their affiliation with the
          temple they represent. We reserve the right to approve, reject, or
          revoke Temple Admin status at our discretion, including where
          verification information is found to be false or where the account is
          used inconsistently with these Terms.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          8. Prohibited Conduct
        </h2>
        <p>
          You agree not to: submit false or malicious reports; post content that
          incites hatred, violence, or discrimination against any individual,
          group, religion, or community; impersonate any person or organization,
          including falsely claiming affiliation with a temple; upload content
          that is unlawful, defamatory, obscene, or infringes on any third
          party's rights; or attempt to interfere with, disrupt, or gain
          unauthorized access to the Service or its underlying systems.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          9. Community Purpose & Tone
        </h2>
        <p>
          Guardian of Temples is intended to foster community connection,
          transparency, and public safety. Content and conduct that promotes
          division, blame toward any community or group, or unverified
          accusations is inconsistent with the purpose of this Service and will
          be moderated accordingly.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          10. Intellectual Property
        </h2>
        <p>
          Content you submit (photos, captions, reports) remains yours, but by
          submitting it you grant Guardian of Temples a non-exclusive,
          worldwide, royalty-free license to display, reproduce, and distribute
          that content within the Service for its intended public-safety and
          community purposes.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          11. Third-Party Services
        </h2>
        <p>
          The Service relies on third-party infrastructure providers (including
          Supabase and Cloudinary) for data storage and media hosting. We are
          not responsible for outages or issues arising from these third-party
          services.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          12. Disclaimer of Warranties
        </h2>
        <p>
          The Service is provided "as is" without warranties of any kind. While
          we take reasonable steps to verify submitted content through our
          moderation process, we do not guarantee the completeness, accuracy, or
          timeliness of any information displayed on the Platform, including
          safety verdicts, incident data, or temple listings.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          13. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, Guardian of Temples and its
          operators shall not be liable for any indirect, incidental, or
          consequential damages arising from your use of, or reliance on, the
          Service, including decisions made based on safety information
          displayed on the Platform.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          14. Emergency Notice
        </h2>
        <p>
          This platform is an informational and community tool only — it is not
          a substitute for emergency services. In the event of an active
          emergency or immediate danger, please contact national emergency
          services directly (999) or your nearest police station without delay.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          15. Termination
        </h2>
        <p>
          We reserve the right to suspend or terminate any account that violates
          these Terms, without prior notice, at our sole discretion.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          16. Governing Law
        </h2>
        <p>
          These Terms are governed by the laws of the People's Republic of
          Bangladesh, without regard to conflict-of-law principles.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          17. Changes to These Terms
        </h2>
        <p>
          We may update these Terms from time to time. Continued use of the
          Service after changes take effect constitutes your acceptance of the
          revised Terms.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          18. Contact Us
        </h2>
        <p>
          For questions regarding these Terms, please contact us at <a href="mailto:support@guardianoftemples.online" className="text-primary-600 hover:underline">support@guardianoftemples.online</a>.
        </p>
      </div>
    </div>
  );
}
