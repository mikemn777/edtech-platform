import ContentPage from '@/components/ContentPage';
import { resolveLanguage } from '@/lib/i18n';

export default function TermsPage({ params }: { params: { lang: string } }) {
  const lang = resolveLanguage(params.lang);
  return (
    <ContentPage lang={lang} title="Terms of Service" lead="The basics of using Eduspark. A development-stage summary.">
      <div className="stack gap-3">
        <div><h3>Using the platform</h3><p className="muted">You agree to provide accurate information and to use Eduspark lawfully and respectfully. Accounts are personal and should be kept secure.</p></div>
        <div><h3>Tutors</h3><p className="muted">Tutors must be verified before appearing in the marketplace. Tutors are responsible for the accuracy of their profiles and the quality of their sessions.</p></div>
        <div><h3>Bookings & payments</h3><p className="muted">Bookings are agreements between learners and tutors. Final pricing, fees, and cancellation terms are being finalised and will be presented clearly before any charge.</p></div>
        <div><h3>Content</h3><p className="muted">You retain rights to content you create. You grant us the permissions needed to operate the service (e.g. displaying your public tutor profile).</p></div>
        <div><h3>Changes</h3><p className="muted">We may update these terms as the platform evolves. Significant changes will be communicated.</p></div>
        <p className="soft small">This document is a development-stage summary and will be replaced by full legal terms before public launch.</p>
      </div>
    </ContentPage>
  );
}