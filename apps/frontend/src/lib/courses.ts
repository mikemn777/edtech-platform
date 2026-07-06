'use client';

import { apiFetch } from './api-client';
import { authed } from './useApi';

export interface Course { id: string; title: string; subject: string; description: string | null }
export interface EnrollmentRow { id: string; type: string; enrollableId: string; status: string; enrolledAt: string }

export function listPublishedCourses(): Promise<Course[]> {
  return apiFetch<Course[]>('curriculum/courses');
}

export function listEnrollments(studentId: string): Promise<EnrollmentRow[]> {
  return authed<EnrollmentRow[]>(`curriculum/students/${studentId}/enrollments`);
}

export function enroll(studentId: string, courseId: string): Promise<unknown> {
  return authed('curriculum/enrollments', {
    method: 'POST',
    body: { studentId, enrollableType: 'COURSE', enrollableId: courseId },
  });
}
