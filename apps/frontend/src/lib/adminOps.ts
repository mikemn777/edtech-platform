'use client';

import { authed } from './useApi';

export interface QueueRow {
  id: string; displayName: string | null; headline: string | null;
  verificationStatus: string; createdAt: string; openCaseId: string | null;
}

export function listVerificationQueue(): Promise<QueueRow[]> {
  return authed<QueueRow[]>('tutor-verification/queue');
}

async function ensureCase(tutorId: string, openCaseId: string | null): Promise<string> {
  if (openCaseId) return openCaseId;
  const c = await authed<{ id: string }>(`tutor-verification/tutors/${tutorId}/cases`, { method: 'POST', body: {} });
  return c.id;
}

export async function decideTutor(tutorId: string, openCaseId: string | null, decision: 'APPROVED' | 'REJECTED'): Promise<void> {
  const caseId = await ensureCase(tutorId, openCaseId);
  await authed(`tutor-verification/cases/${caseId}/decision`, { method: 'POST', body: { decision } });
}

export function revokeTutor(tutorId: string): Promise<unknown> {
  return authed(`tutor-verification/tutors/${tutorId}/revoke`, { method: 'POST', body: {} });
}

export function createCourse(input: { title: string; subject: string; description?: string }): Promise<{ id: string }> {
  return authed<{ id: string }>('curriculum/courses', { method: 'POST', body: input });
}

export function setCourseStatus(id: string, status: 'PUBLISHED' | 'RETIRED'): Promise<unknown> {
  return authed(`curriculum/courses/${id}/status`, { method: 'PATCH', body: { status } });
}
