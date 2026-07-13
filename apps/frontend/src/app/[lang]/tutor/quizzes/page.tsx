'use client';

import { useEffect, useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { tutorNav } from '@/components/navs';
import { getTranslator } from '@/lib/i18n';
import { useSession } from '@/lib/session';
import { listAuthoredQuizzes, createQuiz, addQuestion, quizResults, type AuthoredQuiz, type QuizSubmissionRow } from '@/lib/quizzes';
import { Chart, Check } from '@/components/icons';

interface Draft { prompt: string; options: string[]; correctIndex: number }
const emptyDraft = (): Draft => ({ prompt: '', options: ['', '', '', ''], correctIndex: 0 });

export default function TutorQuizzes({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const session = useSession();

  const [rows, setRows] = useState<AuthoredQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState<Draft[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(false);

  const [openResults, setOpenResults] = useState<string | null>(null);
  const [results, setResults] = useState<QuizSubmissionRow[]>([]);

  async function reload() { setRows(await listAuthoredQuizzes().catch(() => [])); }
  useEffect(() => {
    if (session.loading || !session.authenticated) return;
    reload().finally(() => setLoading(false));
  }, [session.loading, session.authenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  function addDraftQuestion() {
    const opts = draft.options.map((o) => o.trim()).filter(Boolean);
    if (!draft.prompt.trim() || opts.length < 2) { setErr(t('qz.err.question')); return; }
    if (draft.correctIndex >= opts.length) { setErr(t('qz.err.correct')); return; }
    setErr(null);
    setQuestions((qs) => [...qs, { prompt: draft.prompt.trim(), options: opts, correctIndex: draft.correctIndex }]);
    setDraft(emptyDraft());
  }

  async function saveQuiz() {
    if (!title.trim() || questions.length === 0) { setErr(t('qz.err.quiz')); return; }
    setErr(null); setSaving(true); setCreated(false);
    try {
      const { id } = await createQuiz(title.trim());
      for (const q of questions) await addQuestion(id, { prompt: q.prompt, options: q.options, correctIndex: q.correctIndex });
      setTitle(''); setQuestions([]); setDraft(emptyDraft()); setCreated(true);
      await reload();
    } catch { setErr(t('qz.err.save')); } finally { setSaving(false); }
  }

  async function toggleResults(id: string) {
    if (openResults === id) { setOpenResults(null); return; }
    setOpenResults(id);
    setResults(await quizResults(id).catch(() => []));
  }

  return (
    <DashboardShell lang={lang} title={t('qz.t.title')} nav={tutorNav(lang, t)} active={`/${lang}/tutor/quizzes`}>
      <h1 className="mb-0">{t('qz.t.title')}</h1>
      <p className="muted">{t('qz.t.subtitle')}</p>
      {err && <div className="alert alert-danger mb-2" style={{ maxWidth: 760 }}>{err}</div>}

      {/* Builder */}
      <div className="card mt-2" style={{ maxWidth: 760 }}>
        <h3>{t('qz.build')}</h3>
        <div className="field"><label className="label">{t('qz.title')}</label>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('qz.title.ph')} /></div>

        {questions.length > 0 && (
          <div className="stack gap-1 mt-1 mb-2">
            {questions.map((q, i) => (
              <div key={i} className="row between" style={{ background: 'var(--surface-2)', padding: '.5rem .7rem', borderRadius: 8 }}>
                <span className="small"><strong>{i + 1}.</strong> {q.prompt} <span className="muted">({q.options.length} {t('qz.choices')}, ✓ {q.options[q.correctIndex]})</span></span>
                <button className="btn btn-ghost btn-sm" onClick={() => setQuestions((qs) => qs.filter((_, j) => j !== i))}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* draft question */}
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <label className="label">{t('qz.q.prompt')}</label>
          <input className="input" value={draft.prompt} onChange={(e) => setDraft({ ...draft, prompt: e.target.value })} placeholder={t('qz.q.prompt.ph')} />
          <div className="hint mt-1">{t('qz.q.pickCorrect')}</div>
          <div className="stack gap-1 mt-1">
            {draft.options.map((o, i) => (
              <label key={i} className="row gap-2" style={{ alignItems: 'center' }}>
                <input type="radio" name="correct" checked={draft.correctIndex === i} onChange={() => setDraft({ ...draft, correctIndex: i })} />
                <input className="input" value={o} placeholder={`${t('qz.q.option')} ${i + 1}`} onChange={(e) => setDraft({ ...draft, options: draft.options.map((x, j) => j === i ? e.target.value : x) })} />
              </label>
            ))}
          </div>
          <button className="btn btn-outline btn-sm mt-2" onClick={addDraftQuestion}>+ {t('qz.q.add')}</button>
        </div>

        <div className="row gap-2 mt-2">
          <button className="btn btn-primary" disabled={saving || !title.trim() || questions.length === 0} onClick={saveQuiz}>
            {saving ? <span className="spinner" /> : t('qz.publish')}</button>
          {created && <span className="badge badge-ok"><Check width={13} height={13} /> {t('qz.published')}</span>}
        </div>
      </div>

      {/* Authored */}
      <h3 className="mt-4">{t('qz.mine')} ({rows.length})</h3>
      {loading ? (
        <div className="text-c muted mt-2"><span className="spinner" style={{ color: 'var(--primary)' }} /> {t('common.loading')}</div>
      ) : rows.length === 0 ? (
        <p className="muted">{t('qz.empty.t')}</p>
      ) : (
        <div className="stack gap-2 mt-2" style={{ maxWidth: 760 }}>
          {rows.map((q) => (
            <div className="card" key={q.id}>
              <div className="row between wrap gap-2">
                <div><strong>{q.title}</strong><div className="soft small">{q.questionCount} {t('qz.choices.q')} · {q.submissionCount} {t('qz.takers')}</div></div>
                <button className="btn btn-outline btn-sm" onClick={() => toggleResults(q.id)}><Chart width={14} height={14} /> {t('qz.results')}</button>
              </div>
              {openResults === q.id && (
                <div className="mt-2">
                  {results.length === 0 ? <p className="muted small mb-0">{t('qz.noTakers')}</p> : (
                    <div className="stack gap-1">
                      {results.map((r, i) => (
                        <div key={i} className="row between small" style={{ background: 'var(--surface-2)', padding: '.4rem .7rem', borderRadius: 8 }}>
                          <span className="mono">{r.studentId.slice(0, 8)}…</span>
                          <strong style={{ color: 'var(--primary)' }}>{r.score}/{r.maxScore}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
