import { getTranslator, resolveLanguage } from '@/lib/i18n';
import MarketingLayout from '@/components/MarketingLayout';
import { Star, Search, Calendar, Shield, Sparkles, Users, Book, Check, ArrowRight } from '@/components/icons';

/**
 * Premium public landing page. Server-rendered for SEO. All copy is translated
 * via the shared localization bundles (graceful fallback to English).
 */
export default function HomePage({ params }: { params: { lang: string } }) {
  const lang = resolveLanguage(params.lang);
  const t = getTranslator(lang);

  const stats = [
    { n: '1,200+', l: t('home.stat.tutors') },
    { n: '30k+', l: t('home.stat.sessions') },
    { n: '4.9/5', l: t('home.stat.rating') },
    { n: '3', l: t('home.stat.languages') },
  ];

  const features = [
    { icon: <Search />, t: t('home.feat.search.t'), d: t('home.feat.search.d') },
    { icon: <Shield />, t: t('home.feat.verified.t'), d: t('home.feat.verified.d') },
    { icon: <Calendar />, t: t('home.feat.book.t'), d: t('home.feat.book.d') },
    { icon: <Book />, t: t('home.feat.learn.t'), d: t('home.feat.learn.d') },
    { icon: <Users />, t: t('home.feat.family.t'), d: t('home.feat.family.d') },
    { icon: <Sparkles />, t: t('home.feat.ai.t'), d: t('home.feat.ai.d') },
  ];

  const steps = [
    { n: '1', t: t('home.step1.t'), d: t('home.step1.d') },
    { n: '2', t: t('home.step2.t'), d: t('home.step2.d') },
    { n: '3', t: t('home.step3.t'), d: t('home.step3.d') },
  ];

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Arabic', 'Computer Science', 'Islamic Studies'];

  return (
    <MarketingLayout lang={lang}>
      {/* HERO */}
      <section className="hero section">
        <div className="hero-bg" />
        <div className="container" style={{ position: 'relative' }}>
          <div className="grid" style={{ gridTemplateColumns: '1.1fr .9fr', alignItems: 'center', gap: '2.5rem' }}>
            <div>
              <span className="eyebrow"><Sparkles width={15} height={15} /> {t('home.hero.eyebrow')}</span>
              <h1>{t('home.hero.title')}</h1>
              <p className="lead mt-2">{t('home.hero.subtitle')}</p>
              <div className="row gap-2 wrap mt-3">
                <a href={`/${lang}/start`} className="btn btn-primary btn-lg">{t('home.hero.find')} <ArrowRight width={18} height={18} /></a>
                <a href={`/${lang}/tutors`} className="btn btn-outline btn-lg">{t('home.hero.browse')}</a>
              </div>
              <div className="row gap-3 wrap mt-4">
                {stats.slice(0, 3).map((s) => (
                  <div className="stat" key={s.l}><span className="n">{s.n}</span><span className="l">{s.l}</span></div>
                ))}
              </div>
            </div>

            {/* hero visual: a sample tutor card */}
            <div className="card card-pad-lg" style={{ boxShadow: 'var(--shadow-lg)' }}>
              <div className="row between">
                <div className="row gap-2">
                  <div className="avatar" style={{ width: 52, height: 52 }}>SA</div>
                  <div>
                    <strong>Sara A.</strong>
                    <div className="soft small">{t('home.card.subject')}</div>
                  </div>
                </div>
                <span className="badge badge-ok"><Check width={13} height={13} /> {t('home.card.verified')}</span>
              </div>
              <div className="row gap-1 mt-2" style={{ color: 'var(--warn-500)' }}>
                <Star width={16} height={16} /><Star width={16} height={16} /><Star width={16} height={16} /><Star width={16} height={16} /><Star width={16} height={16} />
                <span className="muted small" style={{ marginInlineStart: 6 }}>4.9 · 128 {t('home.card.reviews')}</span>
              </div>
              <div className="divider" />
              <div className="row between wrap gap-1">
                <span className="badge badge-neutral">10+ {t('home.card.years')}</span>
                <span className="badge badge-neutral">320 {t('home.card.hours')}</span>
                <span className="badge">{t('home.card.online')}</span>
              </div>
              <a href={`/${lang}/tutors`} className="btn btn-primary btn-block mt-3">{t('home.card.book')} <ArrowRight width={16} height={16} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="container">
        <div className="card cols-4 grid" style={{ padding: '1.5rem' }}>
          {stats.map((s) => (
            <div className="stat text-c" key={s.l}><span className="n">{s.n}</span><span className="l">{s.l}</span></div>
          ))}
        </div>
      </section>

      {/* PROGRAMS — outcome-led, one decision per card */}
      <section className="section section-alt">
        <div className="container">
        <div className="text-c" style={{ maxWidth: 640, marginInline: 'auto' }}>
          <span className="eyebrow">{t('home.programs.eyebrow')}</span>
          <h2>{t('home.programs.title')}</h2>
          <p className="muted">{t('home.programs.subtitle')}</p>
        </div>
        <div className="stack gap-3 mt-4">
          {[
            { tint: 'rgba(99,102,241,.08)', icon: <Book />, title: t('prog.school.t'), desc: t('prog.school.d'), tags: [t('prog.school.tag1'), t('prog.school.tag2')] },
            { tint: 'rgba(6,182,212,.08)', icon: <Sparkles />, title: t('prog.lang.t'), desc: t('prog.lang.d'), tags: [t('prog.lang.tag1'), t('prog.lang.tag2')] },
            { tint: 'rgba(245,158,11,.10)', icon: <Star width={20} height={20} />, title: t('prog.exam.t'), desc: t('prog.exam.d'), tags: [t('prog.exam.tag1'), t('prog.exam.tag2')] },
          ].map((p) => (
            <div key={p.title} className="card card-pad-lg" style={{ background: p.tint, border: '1px solid var(--border)' }}>
              <div className="grid" style={{ gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '1.5rem' }}>
                <span className="brand-mark hide-sm" style={{ width: 64, height: 64, borderRadius: 18 }}>{p.icon}</span>
                <div>
                  <h3 className="mb-0">{p.title}</h3>
                  <p className="muted mb-0 mt-1">{p.desc}</p>
                  <div className="row wrap gap-1 mt-2">
                    {p.tags.map((tag) => <span key={tag} className="badge" style={{ background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{tag}</span>)}
                  </div>
                </div>
                <a href={`/${lang}/start`} className="btn btn-primary btn-lg" style={{ whiteSpace: 'nowrap' }}>{t('prog.cta')}</a>
              </div>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section container">
        <div className="text-c" style={{ maxWidth: 640, marginInline: 'auto' }}>
          <span className="eyebrow">{t('home.features.eyebrow')}</span>
          <h2>{t('home.features.title')}</h2>
          <p className="muted">{t('home.features.subtitle')}</p>
        </div>
        <div className="grid cols-3 mt-4">
          {features.map((f) => (
            <div className="card card-hover" key={f.t}>
              <div className="brand-mark" style={{ width: 42, height: 42, borderRadius: 12 }}>{f.icon}</div>
              <h3 className="mt-2">{f.t}</h3>
              <p className="muted mb-0">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section section-alt">
        <div className="container">
          <div className="text-c" style={{ maxWidth: 640, marginInline: 'auto' }}>
            <span className="eyebrow">{t('home.how.eyebrow')}</span>
            <h2>{t('home.how.title')}</h2>
          </div>
          <div className="grid cols-3 mt-4">
            {steps.map((s) => (
              <div className="card" key={s.n}>
                <div className="brand-mark" style={{ width: 40, height: 40 }}>{s.n}</div>
                <h3 className="mt-2">{s.t}</h3>
                <p className="muted mb-0">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="section container">
        <div className="text-c">
          <h2>{t('home.subjects.title')}</h2>
          <p className="muted">{t('home.subjects.subtitle')}</p>
        </div>
        <div className="row wrap gap-1 center mt-3">
          {subjects.map((s) => (
            <a key={s} href={`/${lang}/tutors`} className="btn btn-outline btn-pill">{s}</a>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="container" style={{ paddingBottom: '4rem' }}>
        <div className="card card-pad-lg text-c" style={{ background: 'linear-gradient(135deg, var(--brand-600), var(--accent-600))', color: '#fff', border: 'none' }}>
          <h2 style={{ color: '#fff' }}>{t('home.cta.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,.9)', maxWidth: 520, marginInline: 'auto' }}>{t('home.cta.subtitle')}</p>
          <div className="row gap-2 center wrap mt-2">
            <a href={`/${lang}/register`} className="btn btn-lg" style={{ background: '#fff', color: 'var(--brand-700)' }}>{t('cta.getStarted')}</a>
            <a href={`/${lang}/tutors`} className="btn btn-lg btn-outline" style={{ color: '#fff', borderColor: 'rgba(255,255,255,.6)' }}>{t('home.hero.browse')}</a>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}