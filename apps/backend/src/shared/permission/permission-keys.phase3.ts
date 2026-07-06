/**
 * Phase 3 permission catalog (Roles §15.2). Additive; deny-by-default holds.
 */
export const PHASE3_PERMISSIONS = {
  COURSE_MANAGE: 'course.course.manage',
  COURSE_READ: 'course.course.read',
  PROGRAM_MANAGE: 'course.program.manage',
  PATH_MANAGE: 'course.path.manage',
  ENROLLMENT_MANAGE: 'course.enrollment.manage',

  RESOURCE_MANAGE: 'resource.resource.manage',
  RESOURCE_READ: 'resource.resource.read',
  NOTE_MANAGE: 'note.note.manage',

  ASSIGNMENT_MANAGE: 'assignment.assignment.manage',
  ASSIGNMENT_SUBMIT: 'assignment.submission.submit',
  ASSIGNMENT_GRADE: 'assignment.submission.grade',

  ASSESSMENT_MANAGE: 'assessment.assessment.manage',
  ASSESSMENT_TAKE: 'assessment.submission.take',
  ASSESSMENT_GRADE: 'assessment.submission.grade',

  LIVE_SESSION_MANAGE: 'livesession.session.manage',
  LIVE_SESSION_JOIN: 'livesession.session.join',

  CERTIFICATE_ISSUE: 'certificate.certificate.issue',
  CERTIFICATE_READ: 'certificate.certificate.read',

  PROGRESS_READ: 'progress.progress.read',

  NOTIFICATION_SEND: 'notification.channel.send',

  AI_ASSISTANT_USE: 'ai.assistant.use',
  AI_RECOMMENDATION_USE: 'ai.recommendation.use',
} as const;

export type Phase3PermissionKey =
  (typeof PHASE3_PERMISSIONS)[keyof typeof PHASE3_PERMISSIONS];
