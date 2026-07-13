'use client';

import { authed } from './useApi';

export interface ProgressSummary {
  studentId: string;
  enrollments: Record<string, number>;
  assignments: { byStatus: Record<string, number>; gradedSubmissions: number; averageScore: number | null };
  assessments: { gradedSubmissions: number; averageScore: number | null };
  goals: Record<string, number>;
  certificates: Record<string, number>;
  recentProgress: { id: string; metricKey: string; value: number | null; note: string | null; recordedAt: string }[];
}

/** Aggregated view: enrollments, homework, quizzes, goals, certificates (own profile, an active guardian, or staff). */
export function getProgressSummary(studentId: string): Promise<ProgressSummary> {
  return authed<ProgressSummary>(`progress/students/${studentId}/summary`);
}
