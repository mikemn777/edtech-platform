'use client';

import { authed } from './useApi';

export interface AuthoredQuiz { id: string; title: string; status: string; questionCount: number; submissionCount: number; createdAt: string }
export interface PublishedQuiz { id: string; title: string; questionCount: number }
export interface TakeQuestion { id: string; prompt: string; options: string[]; points: number }
export interface TakeQuiz { id: string; title: string; questions: TakeQuestion[] }
export interface QuizResult { score: number; maxScore: number; correct: number; total: number }
export interface MyResult { assessmentId: string; title: string; score: number | null; maxScore: number | null; submittedAt: string | null }
export interface QuizSubmissionRow { studentId: string; score: number | null; maxScore: number | null; submittedAt: string | null }

// Tutor
export function createQuiz(title: string): Promise<{ id: string }> {
  return authed<{ id: string }>('assessments', { method: 'POST', body: { title } });
}
export function addQuestion(quizId: string, q: { prompt: string; options: string[]; correctIndex: number; points?: number }): Promise<unknown> {
  return authed(`assessments/${quizId}/questions`, { method: 'POST', body: q });
}
export function listAuthoredQuizzes(): Promise<AuthoredQuiz[]> {
  return authed<AuthoredQuiz[]>('assessments/authored');
}
export function quizResults(quizId: string): Promise<QuizSubmissionRow[]> {
  return authed<QuizSubmissionRow[]>(`assessments/${quizId}/results`);
}

// Student
export function listPublishedQuizzes(): Promise<PublishedQuiz[]> {
  return authed<PublishedQuiz[]>('assessments/published');
}
export function getQuizToTake(id: string): Promise<TakeQuiz> {
  return authed<TakeQuiz>(`assessments/${id}/take`);
}
export function submitQuiz(id: string, questionIds: string[], selectedIndexes: number[]): Promise<QuizResult> {
  return authed<QuizResult>(`assessments/${id}/submit`, { method: 'POST', body: { questionIds, selectedIndexes } });
}
export function myQuizResults(): Promise<MyResult[]> {
  return authed<MyResult[]>('assessments/mine');
}
