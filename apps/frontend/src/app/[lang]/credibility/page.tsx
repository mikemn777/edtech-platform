'use client';

import ContentPage from '@/components/ContentPage';
import { getTranslator } from '@/lib/i18n';
import { Shield, Award, Check, Users } from '@/components/icons';

export default function CredibilityPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);

  const stats = [
    { n: '1,350+', l: t('cred.stat.tutors') },
    { n: '15,000+', l: t('cred.stat.families') },
    { n: '4.9/5', l: t('cred.stat.rating') },
    { n: '15+', l: t('cred.stat.nationalities') },
  ];
  const pillars = [
    { icon: <Award />, t: t('cred.licensed.t'), d: t('cred.licensed.d') },
    { icon: <Shield />, t: t('cred.safe.t'), d: t('cred.safe.d') },
    { icon: <Check />, t: t('cred.verified.t'), d: t('cred.verified.d') },
    { icon: <Users />, t: t('cred.trusted.t'), d: t('cred.trusted.d') },
  ];

  return (
    <ContentPage lang={lang} title={t('cred.title')} lead={t('cred.lead')} wide>
      <div className="card cols-4 grid" style={{ padding: '1.5rem' }}>
        {stats.map((s) => (
          <div className="stat text-c" key={s.l}><span className="n">{s.n}</span><span className="l">{s.l}</span></div>
        ))}
      </div>
      <div className="grid cols-2 mt-4">
        {pillars.map((p) => (
          <div key={p.t} className="card card-hover">
            <div className="brand-mark" style={{ width: 44, height: 44, borderRadius: 12 }}>{p.icon}</div>
            <h3 className="mt-2 mb-0">{p.t}</h3>
            <p className="muted mt-1 mb-0">{p.d}</p>
          </div>
        ))}
      </div>
      <div className="card card-pad-lg mt-4 text-c">
        <h3 className="mt-0">{t('cred.cta.t')}</h3>
        <p className="muted">{t('cred.cta.d')}</p>
        <a href={`/${lang}/tutors`} className="btn btn-primary btn-lg">{t('nav.tutors')}</a>
      </div>
    </ContentPage>
  );
}
