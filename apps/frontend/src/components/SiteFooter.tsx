import { getTranslator } from '@/lib/i18n';

export default function SiteFooter({ lang }: { lang: string }) {
  const t = getTranslator(lang);
  const year = 2026;
  const cols = [
    { h: t('footer.platform'), links: [
      { href: `/${lang}/tutors`, label: t('nav.tutors') },
      { href: `/${lang}/courses`, label: t('nav.courses') },
      { href: `/${lang}/pricing`, label: t('nav.pricing') },
    ] },
    { h: t('footer.company'), links: [
      { href: `/${lang}/about`, label: t('nav.about') },
      { href: `/${lang}/contact`, label: t('footer.contact') },
      { href: `/${lang}/register?role=tutor`, label: t('footer.becomeTutor') },
    ] },
    { h: t('footer.legal'), links: [
      { href: `/${lang}/privacy`, label: t('footer.privacy') },
      { href: `/${lang}/terms`, label: t('footer.terms') },
    ] },
  ];

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <a href={`/${lang}`} className="brand" style={{ marginBottom: '.75rem' }}>
              <span className="brand-mark">E</span><span>Eduspark</span>
            </a>
            <p className="muted small" style={{ maxWidth: 320 }}>{t('footer.tagline')}</p>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4>{c.h}</h4>
              {c.links.map((l) => (<a key={l.href} href={l.href}>{l.label}</a>))}
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="row between wrap gap-2">
          <span className="soft small">© {year} Eduspark. {t('footer.rights')}</span>
          <span className="soft small">{t('footer.madeFor')}</span>
        </div>
      </div>
    </footer>
  );
}