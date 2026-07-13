'use client';

import { authed } from './useApi';

export interface Submission {
  status: string;
  score: number | null;
  feedback: string | null;
  submittedAt: string | null;
  contentReference: string | null;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  studentId: string;
  courseId: string | null;
  dueAt: string | null;
  status: string; // OPEN | SUBMITTED | GRADED | CLOSED
  createdAt: string;
  submission: Submission | null;
}

/** Student: list my homework. */
export function listStudentAssignments(studentProfileId: string): Promise<Assignment[]> {
  return authed<Assignment[]>(`assignments/students/${studentProfileId}`);
}

/** Student: submit my work (answer text or a link). */
export function submitAssignment(id: string, contentReference: string): Promise<unknown> {
  return authed(`assignments/${id}/submit`, { method: 'POST', body: { contentReference } });
}

/** Tutor: homework I assigned. */
export function listAuthoredAssignments(): Promise<Assignment[]> {
  return authed<Assignment[]>('assignments/authored');
}

/** Tutor: assign new homework to a student by their link code. */
export function createAssignment(input: {
  title: string;
  description?: string;
  studentAccountId: string;
  dueAt?: string;
}): Promise<unknown> {
  return authed('assignments', { method: 'POST', body: input });
}

/** Tutor: grade a submission (score 0–100 + feedback). */
export function gradeAssignment(id: string, score: number, feedback?: string): Promise<unknown> {
  return authed(`assignments/${id}/grade`, { method: 'POST', body: { score, feedback } });
}
