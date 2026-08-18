import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-primary-500" />
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
      </div>
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Last updated: [Insert Date]
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          1. Introduction
        </h2>
        <p>
          Guardian of Temples ("we," "us," "our," or "the Platform") is a
          community platform that enables verified temple committees to share
          updates and enables the public to access safety-related information
          across Bangladesh. This Privacy Policy explains how we collect, use,
          store, and protect information when you use our website and mobile
          application (collectively, the "Service").
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          2. Information We Collect
        </h2>
        <p>
          <strong>Account Information:</strong> When you register, we collect
          your full name, email address, and optionally your phone number.
        </p>
        <p>
          <strong>Submission Information:</strong> When you submit an incident
          report, we collect the details you provide (location, date,
          description, optional evidence images) and, if voluntarily provided,
          your contact information for follow-up verification purposes only.
        </p>
        <p>
          <strong>Temple Admin Verification:</strong> When you apply to
          represent a temple, we collect your name, phone number, your role at
          the temple, and any supporting documentation you upload to verify your
          affiliation.
        </p>
        <p>
          <strong>Usage Data:</strong> We may collect basic technical
          information (device type, browser, general location inferred from IP)
          for security and service-improvement purposes.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          3. How We Use Your Information
        </h2>
        <p>
          We use collected information to: operate and maintain the Service;
          verify the authenticity of incident reports and temple admin
          applications; display approved content (temple posts, verified
          incident data) publicly; communicate with you about your account,
          submissions, or moderation decisions; and improve the safety,
          reliability, and usability of the platform.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          4. What We Make Public vs. What We Keep Private
        </h2>
        <p>
          Approved incident reports are displayed publicly in aggregated,
          factual form (location, date, type, description). Your identity as a
          submitter is <strong>never displayed publicly</strong>. Contact
          details you optionally provide with a submission are visible only to
          our moderators and administrators, solely for verification and
          follow-up purposes.
        </p>
        <p>
          Temple post content (photos and captions) shared by verified Temple
          Admins is public by design, as it represents official updates from the
          temple committee.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          5. Data Sharing & Disclosure
        </h2>
        <p>
          We do not sell, rent, or trade your personal information to third
          parties, including advertisers. We may share information with law
          enforcement or government authorities only where required by law, or
          voluntarily where doing so could reasonably help prevent harm, subject
          to applicable legal process.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          6. Data Security
        </h2>
        <p>
          We implement industry-standard security measures, including encrypted
          authentication, Row-Level Security (RLS) database policies restricting
          access based on user roles, and secure third-party infrastructure
          (Supabase, Cloudinary) for data storage and media hosting. No system
          is completely secure, and we cannot guarantee absolute security of
          information transmitted over the internet.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          7. Data Retention
        </h2>
        <p>
          We retain account and submission data for as long as your account is
          active or as needed to fulfill the purposes described in this policy,
          including maintaining an accurate historical record for safety and
          moderation transparency. Rejected or removed submissions are retained
          in moderation logs for audit purposes rather than permanently deleted.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          8. Your Rights
        </h2>
        <p>
          You may request access to, correction of, or deletion of your personal
          account information by contacting us at [insert contact email]. Note
          that publicly approved incident data and temple posts may be retained
          in aggregated or anonymized form for the continued integrity of the
          safety map, even if your account is deleted.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          9. Cookies & Local Storage
        </h2>
        <p>
          We use minimal essential cookies/local storage for authentication
          sessions and basic preferences (such as dark/light mode). We do not
          use third-party advertising or tracking cookies.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          10. Children's Privacy
        </h2>
        <p>
          The Service is not directed at children under 13, and we do not
          knowingly collect personal information from children under 13.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          11. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes
          will be communicated via the Platform. Continued use of the Service
          after changes take effect constitutes acceptance of the revised
          policy.
        </p>

        <h2 className="font-bold text-sm text-slate-900 dark:text-white">
          12. Contact Us
        </h2>
        <p>
          For questions or requests regarding this Privacy Policy, please
          contact us at <a href="mailto:support@guardianoftemples.online" className="text-primary-600 hover:underline">support@guardianoftemples.online</a>.
        </p>
      </div>
    </div>
  );
}
