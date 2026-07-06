import ContentPage from '@/components/ContentPage';
import { resolveLanguage } from '@/lib/i18n';
import { Check } from '@/components/icons';

export default function PricingPage({ params }: { params: { lang: string } }) {
  const lang = resolveLanguage(params.lang);
  const tiers = [
    { name: 'Starter', price: 'Free', tagline: 'Explore and find your tutor', features: ['Browse verified tutors', 'Save favourites', 'Message tutors', 'Community support'], cta: 'Get started', highlight: false },
    { name: 'Learner', price: 'Pay per session', tagline: 'Book sessions as you go', features: ['Everything in Starter', 'Book & manage sessions', 'Progress tracking', 'Homework & assessments'], cta: 'Get started', highlight: true },
    { name: 'Family', price: 'Custom', tagline: 'For parents with multiple children', features: ['Everything in Learner', 'Link multiple children', 'Parent oversight & reports', 'Priority support'], cta: 'Contact us', highlight: false },
  ];
  return (
    <ContentPage lang={lang} title="Simple, transparent pricing" lead="Start free. Pay only for the sessions you book. No hidden fees." wide>
      <div className="grid cols-3">
        {tiers.map((tier) => (
          <div key={tier.name} className="card card-pad-lg" style={tier.highlight ? { borderColor: 'var(--primary)', boxShadow: '0 0 0 3px var(--ring)' } : {}}>
            {tier.highlight && <span className="badge mb-2">Most popular</span>}
            <h3>{tier.name}</h3>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-.02em' }}>{tier.price}</div>
            <p className="muted small">{tier.tagline}</p>
            <div className="divider" />
            <div className="stack gap-1">
              {tier.features.map((f) => (
                <div className="row gap-2" key={f}>
                  <span style={{ color: 'var(--ok-500)' }}><Check width={16} height={16} /></span>
                  <span className="small">{f}</span>
                </div>
              ))}
            </div>
            <a href={`/${lang}/register`} className={`btn btn-block mt-3 ${tier.highlight ? 'btn-primary' : 'btn-outline'}`}>{tier.cta}</a>
          </div>
        ))}
      </div>
      <p className="soft small text-c mt-4">Final pricing, commission, and cancellation policies are being finalised. Displayed tiers are indicative.</p>
    </ContentPage>
  );
}