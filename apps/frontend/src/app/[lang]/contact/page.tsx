'use client';

import { useState, type FormEvent } from 'react';
import ContentPage from '@/components/ContentPage';

export default function ContactPage({ params }: { params: { lang: string } }) {
  const lang = params.lang;
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <ContentPage lang={lang} title="Contact us" lead="Questions, feedback, or partnership ideas? We'd love to hear from you.">
      <div className="grid cols-2" style={{ alignItems: 'start' }}>
        <div className="card">
          {sent ? (
            <div className="alert alert-ok">Thanks! Your message has been noted — we&apos;ll get back to you soon.</div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="field"><label className="label">Name</label><input className="input" required /></div>
              <div className="field"><label className="label">Email</label><input className="input" type="email" required /></div>
              <div className="field"><label className="label">Message</label><textarea className="textarea" rows={5} required /></div>
              <button className="btn btn-primary btn-block" type="submit">Send message</button>
            </form>
          )}
        </div>
        <div className="stack gap-2">
          <div className="card"><strong>Email</strong><p className="muted small mb-0">support@eduspark.example</p></div>
          <div className="card"><strong>For tutors</strong><p className="muted small mb-0">Want to teach on Eduspark? <a href={`/${lang}/register?role=tutor`} style={{ color: 'var(--primary)', fontWeight: 600 }}>Apply here</a>.</p></div>
          <div className="card"><strong>Support hours</strong><p className="muted small mb-0">Sunday–Thursday, 9:00–18:00</p></div>
        </div>
      </div>
    </ContentPage>
  );
}