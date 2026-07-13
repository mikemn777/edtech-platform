'use client';

import { authed } from './useApi';

export interface NoteRow {
  id: string;
  title: string | null;
  body: string;
  contextType: string | null;
  contextId: string | null;
  createdAt: string;
  updatedAt: string;
}

export function listNotes(): Promise<NoteRow[]> {
  return authed<NoteRow[]>('notes');
}

export function createNote(input: { title?: string; body: string }): Promise<NoteRow> {
  return authed<NoteRow>('notes', { method: 'POST', body: input });
}

export function updateNote(id: string, input: { title?: string; body?: string }): Promise<NoteRow> {
  return authed<NoteRow>(`notes/${id}`, { method: 'PATCH', body: input });
}

export function deleteNote(id: string): Promise<unknown> {
  return authed(`notes/${id}`, { method: 'DELETE' });
}
