'use client';

import { authed } from './useApi';

export interface GuardianshipRow { id: string; studentAccountId: string; status: string; establishedAt: string }
export interface MonitorSummary { studentProfileId: string; summary: { activeGoals: number; progressEntries: number; upcomingBookings: number } }

export function listGuardianships(parentAccountId: string): Promise<GuardianshipRow[]> {
  return authed<GuardianshipRow[]>(`relationships/parents/${parentAccountId}/guardianships`);
}

export function linkChild(parentAccountId: string, studentAccountId: string): Promise<unknown> {
  return authed('relationships/guardianships', { method: 'POST', body: { parentAccountId, studentAccountId } });
}

export function monitorChild(parentAccountId: string, studentAccountId: string): Promise<MonitorSummary> {
  return authed<MonitorSummary>(`parents/${parentAccountId}/children/${studentAccountId}/monitor`);
}
