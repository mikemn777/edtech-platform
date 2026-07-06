'use client';

import { authed } from './useApi';

const IDS_KEY = 'edu.bookingIds';

/** Resolve the current user's student profile id, creating one if needed. */
export async function ensureStudentProfileId(): Promise<string> {
  const me = await authed<{ id: string } | null>('students/profiles/me');
  if (me && me.id) return me.id;
  const created = await authed<{ id: string }>('students/profiles', { method: 'POST', body: {} });
  return created.id;
}

export interface BookingResult { id: string; status?: string }

/** Create a booking request for a tutor slot. */
export async function createBooking(input: {
  studentId: string;
  tutorId: string;
  scheduledStart: string;
  scheduledEnd: string;
  availabilityId?: string;
  offeringId?: string;
}): Promise<BookingResult> {
  const res = await authed<BookingResult>('bookings', { method: 'POST', body: input });
  if (res?.id) rememberBooking(res.id);
  return res;
}

export function rememberBooking(id: string): void {
  if (typeof window === 'undefined') return;
  const ids = getBookingIds();
  if (!ids.includes(id)) window.localStorage.setItem(IDS_KEY, JSON.stringify([id, ...ids].slice(0, 100)));
}

export function getBookingIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(IDS_KEY) || '[]'); } catch { return []; }
}

export function getBooking<T = unknown>(id: string): Promise<T> {
  return authed<T>(`bookings/${id}`);
}

export function cancelBooking(id: string, reason?: string): Promise<unknown> {
  return authed(`bookings/${id}/cancel`, { method: 'POST', body: reason ? { reason } : {} });
}

export interface TutorBookingRow {
  id: string;
  studentId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
}

export function listTutorBookings(tutorId: string, status?: string): Promise<TutorBookingRow[]> {
  const qs = status ? `?status=${status}` : '';
  return authed<TutorBookingRow[]>(`bookings/tutors/${tutorId}/list${qs}`);
}

export function confirmBooking(id: string): Promise<unknown> {
  return authed(`bookings/${id}/confirm`, { method: 'POST', body: {} });
}

export function rejectBooking(id: string, reason?: string): Promise<unknown> {
  return authed(`bookings/${id}/reject`, { method: 'POST', body: reason ? { reason } : {} });
}

export function completeBooking(id: string): Promise<unknown> {
  return authed(`bookings/${id}/complete`, { method: 'POST', body: {} });
}