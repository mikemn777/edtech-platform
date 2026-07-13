'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { studentNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { listPublishedQuizzes, getQuizToTake, submitQuiz, myQuizResults, type PublishedQuiz, type TakeQuiz, type QuizResult, type MyResult } from '@/lib/quizzes';
import { Chart, Check, ArrowRight } from '@/components/icons';

export default function StudentQuizzes({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();

  const [published, setPublished] = useState<PublishedQuiz[]>([]);
  const [mine, setMine] = useState<MyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [taking, setTaking] = useState<TakeQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  async function reload() {
    const [p, m] = await Promise.all([listPublishedQuizzes().catch(() => []), myQuizResults().catch(() => [])]);
    setPublished(p); setMine(m);
  }
  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    reload().finally(() => setLoading(false));
  }, [session.loading, session.authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  async function startQuiz(id: string) {
    setErr(null); setResult(null); setAnswers({});
    try { setTaking(await getQuizToTake(id)); } catch { setErr(t('qz.err.load')); }
  }

  async function onSubmit() {
    if (!taking) return;
    const qids = taking.questions.map((q) => q.id);
    if (qids.some((id) => answers[id] === undefined)) { setErr(t('qz.err.all')); return; }
    setErr(null); setSubmitting(true);
    try {
      const r = await submitQuiz(taking.id, qids, qids.map((id) => answers[id]));
      setResult(r); setTaking(null); await reload();
    } catch { setErr(t('qz.err.submit')); } finally { setSubmitting(false); }
  }

  // ---- Taking view ----
  if (taking) {
    return (
      <DashboardShell lang={lang} title={taking.title} nav={studentNav(lang, t)} active={`/${lang}/student/quizzes`}>
        <h1 className="mb-0">{taking.title}</h1>
        <p className="muted">{taking.questions.length} {t('qz.choices.q')}</p>
        {err && <div className="alert alert-danger mb-2" style={{ maxWidth: 720 }}>{err}</div>}
        <div className="stack gap-2" style={{ maxWidth: 720 }}>
          {taking.questions.map((q, qi) => (
            <div className="card" key={q.id}>
              <strong>{qi + 1}. {q.prompt}</strong>
              <div className="stack gap-1 mt-2">
                {q.options.map((o, i) => (
                  <label key={i} className="row gap-2" style={{ alignItems: 'center', cursor: 'pointer' }}>
                    <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="row gap-2 mt-3">
          <button className="btn btn-primary" disabled={submitting} onClick={onSubmit}>{submitting ? <span className="spinner" /> : t('qz.submit')}</button>
          <button className="btn btn-ghost" onClick={() => { setTaking(null); setErr(null); }}>{t('common.back')}</button>
        </div>
      </DashboardShell>
    );
  }

  // ---- List view ----
  return (
    <DashboardShell lang={lang} title={t('qz.s.title')} nav={studentNav(lang, t)} active={`/${lang}/student/quizzes`}>
      <h1 className="mb-0">{t('qz.s.title')}</h1>
      <p className="muted">{t('qz.s.subtitle')}</p>
      {err && <div className="alert alert-danger mb-2" style={{ maxWidth: 720 }}>{err}</div>}

      {result && (
        <div className="card mt-2" style={{ maxWidth: 720, borderColor: 'var(--primary)' }}>
          <div className="row gap-2"><div className="brand-mark" style={{ width: 40, height: 40 }}><Check /></div>
            <div><h3 className="mb-0">{t('qz.done')}</h3>
              <p className="muted small mb-0">{t('qz.youGot')} <strong style={{ color: 'var(--primary)' }}>{result.correct}/{result.total}</strong> · {result.score}/{result.maxScore} {t('qz.points')}</p></div></div>
        </div>
      )}

      <h3 className="mt-3">{t('qz.available')}</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : published.length === 0 ? (
        <p className="muted">{t('qz.empty.s')}</p>
      ) : (
        <div className="grid cols-2 mt-2" style={{ maxWidth: 760 }}>
          {published.map((q) => (
            <div className="card card-hover" key={q.id}>
              <div className="brand-mark" style={{ width: 38, height: 38 }}><Chart /></div>
              <h3 className="mt-2 mb-0">{q.title}</h3>
              <p className="muted small">{q.questionCount} {t('qz.choices.q')}</p>
              <button className="btn btn-primary btn-sm" onClick={() => startQuiz(q.id)}>{t('qz.take')} <ArrowRight width={14} height={14} /></button>
            </div>
          ))}
        </div>
      )}

      {mine.length > 0 && (
        <>
          <h3 className="mt-4">{t('qz.myResults')}</h3>
          <div className="stack gap-1 mt-2" style={{ maxWidth: 720 }}>
            {mine.map((r, i) => (
              <div key={i} className="row between small" style={{ background: 'var(--surface-2)', padding: '.5rem .8rem', borderRadius: 8 }}>
                <span>{r.title}</span>
                <strong style={{ color: 'var(--primary)' }}>{r.score}/{r.maxScore}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </DashboardShell>
  );
}
