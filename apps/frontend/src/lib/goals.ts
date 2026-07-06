'use client';

import { authed } from './useApi';

export interface Goal { id: string; title: string; description: string | null; targetDate: string | null; status: string }

export function listGoals(studentId: string): Promise<Goal[]> {
  return authed<Goal[]>(`students/${studentId}/goals`);
}

export function createGoal(studentId: string, input: { title: string; description?: string; targetDate?: string }): Promise<unknown> {
  return authed(`students/${studentId}/goals`, { method: 'POST', body: input });
}

export function setGoalStatus(studentId: string, goalId: string, status: 'ACTIVE' | 'ACHIEVED' | 'ABANDONED'): Promise<unknown> {
  return authed(`students/${studentId}/goals/${goalId}/status`, { method: 'PATCH', body: { status } });
}
