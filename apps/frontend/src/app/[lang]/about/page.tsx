import ContentPage from '@/components/ContentPage';
import { resolveLanguage } from '@/lib/i18n';
import { Shield, Globe, Users, Sparkles } from '@/components/icons';

export default function AboutPage({ params }: { params: { lang: string } }) {
  const lang = resolveLanguage(params.lang);
  const values = [
    { icon: <Shield />, t: 'Trust & safety', d: 'Every tutor is verified, and learner data — especially for minors — is protected by design.' },
    { icon: <Globe />, t: 'Built for the region', d: 'Multi-country and multi-language from day one, with first-class right-to-left support.' },
    { icon: <Users />, t: 'For the whole family', d: 'Students, parents, and tutors each get an experience tailored to them.' },
    { icon: <Sparkles />, t: 'Smarter learning', d: 'Recommendations and progress tracking help every learner move forward.' },
  ];
  return (
    <ContentPage lang={lang} title="About Eduspark" lead="Our mission is to make high-quality, personalised education accessible to every learner.">
      <p className="muted">
        Eduspark connects students and families with verified, trusted tutors, and gives educators the tools to teach and grow.
        We believe learning works best when it fits the learner — their subject, their level, their language, and their pace.
      </p>
      <div className="grid cols-2 mt-3">
        {values.map((v) => (
          <div className="card" key={v.t}>
            <div className="brand-mark" style={{ width: 40, height: 40 }}>{v.icon}</div>
            <h3 className="mt-2">{v.t}</h3>
            <p className="muted small mb-0">{v.d}</p>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}