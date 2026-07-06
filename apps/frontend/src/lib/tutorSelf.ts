'use client';

import { authed } from './useApi';

export interface MyTutorProfile { id: string; accountId: string; headline: string | null; bio: string | null; verificationStatus: string }
export interface SubjectRow { id: string; subject: string }
export interface AvailabilityRow { id: string; startAt: string; endAt: string; status: string }

export function getMyTutorProfile(): Promise<MyTutorProfile | null> {
  return authed<MyTutorProfile | null>('tutors/profiles/me');
}

export function createMyTutorProfile(headline: string, bio: string): Promise<MyTutorProfile> {
  return authed<MyTutorProfile>('tutors/profiles', { method: 'POST', body: { headline, bio } });
}

export function updateTutorProfile(id: string, data: { headline?: string; bio?: string }): Promise<unknown> {
  return authed(`tutors/profiles/${id}`, { method: 'PATCH', body: data });
}

export function listSubjects(tutorId: string): Promise<SubjectRow[]> {
  return authed<SubjectRow[]>(`tutors/${tutorId}/subjects`);
}
export function addSubject(tutorId: string, subject: string): Promise<unknown> {
  return authed(`tutors/${tutorId}/subjects`, { method: 'POST', body: { subject: subject.toLowerCase().trim() } });
}
export function removeSubject(tutorId: string, subjectId: string): Promise<unknown> {
  return authed(`tutors/${tutorId}/subjects/${subjectId}`, { method: 'DELETE' });
}

export function listAvailability(tutorId: string): Promise<AvailabilityRow[]> {
  return authed<AvailabilityRow[]>(`tutors/${tutorId}/availability`);
}
export function addAvailability(tutorId: string, startAt: string, endAt: string): Promise<unknown> {
  return authed(`tutors/${tutorId}/availability`, { method: 'POST', body: { startAt, endAt } });
}
export function cancelAvailability(tutorId: string, availabilityId: string): Promise<unknown> {
  return authed(`tutors/${tutorId}/availability/${availabilityId}`, { method: 'DELETE' });
}