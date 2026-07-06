'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslator, getDirection } from '@/lib/i18n';
import { ArrowRight, Check, User, Users } from '@/components/icons';

/**
 * Guided onboarding wizard — one friendly question per screen with a progress
 * bar, inspired by best-in-class tutoring onboarding (original design/copy).
 * Collects: role → grade stage → subjects → preferred times (skippable), then
 * hands off to the marketplace with the chosen subject pre-filtered.
 */

const SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Arabic', 'Computer Science', 'Islamic Studies'];
const STAGES: { key: string; grades: number[] }[] = [
  { key: 'elementary', grades: [1, 2, 3, 4, 5, 6] },
  { key: 'middle', grades: [7, 8, 9] },
  { key: 'high', grades: [10, 11, 12] },
];
const PERIODS = ['morning', 'noon', 'evening'] as const;

export default function StartWizard({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const t = getTranslator(lang);
  const dir = getDirection(lang);
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'parent' | 'student' | null>(null);
  const [openStage, setOpenStage] = useState<string | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Set<string>>(new Set());
  const [times, setTimes] = useState<Set<string>>(new Set());

  const TOTAL = 4;
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const d = new Date(2026, 2, 1 + i); // a fixed Sunday-start week
    return { key: String(i), label: d.toLocaleDateString(lang === 'ar' ? 'ar' : lang === 'tr' ? 'tr' : 'en', { weekday: 'short' }) };
  });

  function next() { setStep((s) => Math.min(s + 1, TOTAL - 1)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function finish() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('edu.prefs', JSON.stringify({
        role, grade, subjects: [...subjects], times: [...times],
      }));
    }
    router.push(`/${lang}/tutors`);
  }

  function toggle(set: Set<string>, value: string, apply: (s: Set<string>) => void) {
    const nextSet = new Set(set);
    if (nextSet.has(value)) nextSet.delete(value); else nextSet.add(value);
    apply(nextSet);
  }

  const canNext =
    (step === 0 && role !== null) ||
    (step === 1 && grade !== null) ||
    (step === 2 && subjects.size > 0) ||
    step === 3;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* minimal header */}
      <header style={{ background: 'var(--bg-elev)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href={`/${lang}`} className="brand"><span className="brand-mark">E</span><span>Eduspark</span></a>
          <a href={`/${lang}`} className="btn btn-ghost btn-sm">{t('wiz.exit')}</a>
        </div>
      </header>

      {/* progress */}
      <div className="container" style={{ maxWidth: 640, paddingTop: '1.5rem' }}>
        <div className="row gap-2" style={{ alignItems: 'center' }}>
          {step > 0 && (
            <button className="icon-btn" onClick={back} aria-label={t('common.prev')} style={{ transform: dir === 'rtl' ? 'scaleX(-1)' : 'none' }}>
              <ArrowRight width={16} height={16} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
          <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${((step + 1) / TOTAL) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 999, transition: 'width .3s ease' }} />
          </div>
          <span className="soft small">{step + 1}/{TOTAL}</span>
        </div>
      </div>

      <main className="container" style={{ maxWidth: 640, paddingBlock: '2.5rem' }}>
        {/* STEP 0 — who */}
        {step === 0 && (
          <>
            <h1 style={{ fontSize: '1.7rem' }}>{t('wiz.who.title')}</h1>
            <div className="stack gap-2 mt-3">
              {([
                { key: 'parent' as const, icon: <Users />, label: t('role.parent'), desc: t('role.parent.desc') },
                { key: 'student' as const, icon: <User />, label: t('role.student'), desc: t('role.student.desc') },
              ]).map((r) => (
                <button key={r.key} onClick={() => { setRole(r.key); setStep(1); }}
                  className="card card-hover row gap-2"
                  style={{ cursor: 'pointer', textAlign: 'start', borderColor: role === r.key ? 'var(--primary)' : 'var(--border)' }}>
                  <span className="brand-mark" style={{ width: 44, height: 44 }}>{r.icon}</span>
                  <span style={{ flex: 1 }}>
                    <strong style={{ display: 'block' }}>{r.label}</strong>
                    <span className="muted small">{r.desc}</span>
                  </span>
                  <ArrowRight width={18} height={18} style={{ color: 'var(--text-soft)', transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
                </button>
              ))}
            </div>
          </>
        )}

        {/* STEP 1 — grade stage accordion */}
        {step === 1 && (
          <>
            <h1 style={{ fontSize: '1.7rem' }}>{role === 'parent' ? t('wiz.grade.title.parent') : t('wiz.grade.title.student')}</h1>
            <p className="muted">{t('wiz.grade.hint')}</p>
            <div className="stack gap-2 mt-2">
              {STAGES.map((s) => {
                const open = openStage === s.key;
                return (
                  <div key={s.key}>
                    <button onClick={() => setOpenStage(open ? null : s.key)}
                      className="card row between full"
                      style={{ cursor: 'pointer', padding: '.9rem 1.1rem', borderColor: open ? 'var(--primary)' : 'var(--border)', background: open ? 'var(--brand-50)' : 'var(--surface)' }}>
                      <strong>{t(`wiz.stage.${s.key}`)}</strong>
                      <span className="soft">{open ? '▴' : '▾'}</span>
                    </button>
                    {open && (
                      <div className="row wrap gap-1 mt-2" style={{ paddingInlineStart: '.5rem' }}>
                        {s.grades.map((g) => {
                          const key = `${s.key}-${g}`;
                          return (
                            <button key={key} onClick={() => { setGrade(key); setStep(2); }}
                              className={`btn btn-sm ${grade === key ? 'btn-primary' : 'btn-outline'}`}>
                              {t('wiz.grade')} {g}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* STEP 2 — subjects */}
        {step === 2 && (
          <>
            <h1 style={{ fontSize: '1.7rem' }}>{role === 'parent' ? t('wiz.subjects.title.parent') : t('wiz.subjects.title.student')}</h1>
            <p className="muted">{t('wiz.subjects.hint')}</p>
            <div className="row wrap gap-1 mt-2">
              {SUBJECTS.map((s) => {
                const on = subjects.has(s);
                return (
                  <button key={s} onClick={() => toggle(subjects, s, setSubjects)}
                    className={`btn btn-pill ${on ? 'btn-primary' : 'btn-outline'}`}>
                    {on && <Check width={14} height={14} />} {s}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* STEP 3 — preferred times */}
        {step === 3 && (
          <>
            <h1 style={{ fontSize: '1.7rem' }}>{t('wiz.times.title')}</h1>
            <p className="muted">{t('wiz.times.hint')}</p>
            <div className="card card-flush mt-2" style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    <th style={cell}></th>
                    {PERIODS.map((p) => <th key={p} style={{ ...cell, fontWeight: 700, fontSize: '.8rem' }}>{t(`wiz.period.${p}`)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d.key} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ ...cell, fontWeight: 600, fontSize: '.85rem' }}>{d.label}</td>
                      {PERIODS.map((p) => {
                        const key = `${d.key}-${p}`;
                        const on = times.has(key);
                        return (
                          <td key={p} style={{ ...cell, textAlign: 'center' }}>
                            <button onClick={() => toggle(times, key, setTimes)} aria-pressed={on}
                              style={{
                                width: 26, height: 26, borderRadius: 8, cursor: 'pointer',
                                border: `2px solid ${on ? 'var(--primary)' : 'var(--border-2)'}`,
                                background: on ? 'var(--primary)' : 'transparent',
                                color: '#fff', display: 'inline-grid', placeItems: 'center',
                              }}>
                              {on && <Check width={14} height={14} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* footer actions */}
        <div className="row between mt-4">
          <span>
            {step === 3 && <button className="btn btn-ghost" onClick={finish}>{t('wiz.skip')}</button>}
          </span>
          {step > 0 && (
            <button className="btn btn-primary btn-lg" disabled={!canNext} onClick={step === 3 ? finish : next}>
              {step === 3 ? t('wiz.finish') : t('wiz.continue')} <ArrowRight width={18} height={18} style={{ transform: dir === 'rtl' ? 'rotate(180deg)' : 'none' }} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

const cell: React.CSSProperties = { padding: '.55rem .8rem', textAlign: 'start' };
