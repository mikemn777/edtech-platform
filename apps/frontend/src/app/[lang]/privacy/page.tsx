import ContentPage from '@/components/ContentPage';
import { resolveLanguage } from '@/lib/i18n';

export default function PrivacyPage({ params }: { params: { lang: string } }) {
  const lang = resolveLanguage(params.lang);
  return (
    <ContentPage lang={lang} title="Privacy Policy" lead="How we handle your data. This is a summary for the platform in development.">
      <div className="stack gap-3">
        <div><h3>Data we collect</h3><p className="muted">Account details you provide (name, email), the content you create (profiles, bookings, learning activity), and technical data needed to run the service securely.</p></div>
        <div><h3>How we use it</h3><p className="muted">To provide and improve the service: matching learners with tutors, managing sessions, and keeping accounts secure. We do not sell your personal data.</p></div>
        <div><h3>Protecting minors</h3><p className="muted">Learner data — especially for minors — is treated with extra care and is not shared for advertising. Access is limited and audited.</p></div>
        <div><h3>Your rights</h3><p className="muted">You can request access to, correction of, or deletion of your personal data. Contact us to exercise these rights.</p></div>
        <div><h3>Security</h3><p className="muted">Passwords are hashed, access is permission-controlled, and sensitive actions are logged. No system is perfectly secure, but protecting your data is a core priority.</p></div>
        <p className="soft small">This document is a development-stage summary and will be replaced by a full legal policy before public launch.</p>
      </div>
    </ContentPage>
  );
}