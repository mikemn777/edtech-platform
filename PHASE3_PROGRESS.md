# Phase 3 Progress Tracker — Learning Delivery, Communication, Intelligence

> Continues additively from Phases 1/2/2b. No completed file rewritten.
> Schema for ALL Phase 3 modules is in place (migration 0000000000003); modules
> below marked "schema ready" just need their service/controller in continuation.

## Completed this response
- [x] **Courses / Programs / Learning Paths / Enrollment** — `curriculum` module
      (create/publish courses, compose programs, build paths, enroll students;
      published-only enrollment; educational-alignment rules PBD/BR-104).
- [x] **Live Sessions** — `live-sessions` module: business lifecycle
      (SCHEDULED→IN_PROGRESS→COMPLETED/NO_SHOW/CANCELLED) with governed
      transitions, verified-tutor gate (BR-002), attendance capture.
- [x] **Video Integration** — provider-independent `VIDEO_PROVIDER` port +
      default null adapter (Constitution Art. VII); real media provider is a PTD
      that plugs in with zero domain change. No recording initiated (BR-106 PBD).
- [x] **AI Learning Assistant** — `ai` module, provider-independent `AI_PROVIDER`
      port + local default adapter; every interaction audited (Art. 7.4).
- [x] **AI Recommendations** — application gathers candidates (privacy-controlled),
      provider only ranks; provider-independent.
- [x] **Notifications / Email / SMS / Push** — `notification-channels` module:
      Email/SMS/Push adapters implementing the EXISTING Phase 1 notification port
      (additive) + multi-channel dispatch facade. Concrete providers are PTDs;
      consent/contact rules (esp. minors) remain PBD/BR-103.

## Schema + migration
- Prisma extended with 19 models (total 55): Course, CourseModule, Program,
  ProgramCourse, LearningPath, LearningPathStep, Enrollment, Resource, Note,
  Assignment, AssignmentSubmission, Assessment, AssessmentQuestion,
  AssessmentSubmission, AssessmentAnswer, LiveSession, SessionAttendance,
  Certificate, AIInteraction. 9 new enums.
- Migration `0000000000003_phase3_learning` (19 tables, 26 FKs, indexes, enums).
  Cross-refs to prior tables are scalar FKs (enforced at DB level); prior models
  untouched.

## Remaining (schema ready — build service/controller next)
- [ ] **Files / Resources** — `resource` model ready; wrap FileStorage port (Phase 1)
      to store/serve resources with access control.
- [ ] **Notes** — `note` model ready; self-scoped CRUD.
- [ ] **Homework / Assignments** — `assignment` + `assignment_submission` ready;
      assign → submit → grade workflow (minor_related, audited).
- [ ] **Assessments / Quizzes** — `assessment`/`question`/`submission`/`answer`
      ready; server-side grading (answer key never exposed), quiz vs assessment kind.
- [ ] **Student Progress** — aggregate enrollments + assignment/assessment results
      + ProgressRecord (Phase 2b) into a progress view (read-only).
- [ ] **Certificates** — `certificate` model ready; issue on completion, unique
      serial, revoke; verification endpoint.

## Governance invariants held
- Provider independence (Art. VII) for BOTH Video and AI via ports/adapters —
  no vendor concept crosses the boundary; swapping providers = config change.
- Verified-tutor gate (BR-002) on live sessions.
- Minors (Art. VI): learner data classified minor_related; AI interactions audited;
  no external data sharing with the default AI adapter; recording rules not invented.
- Assessment answer keys stored server-side only, never exposed to students.
- Every mutation audited; deny-by-default authorization on every route.

## Authorization
- `permission-keys.phase3.ts` catalog added (course/resource/note/assignment/
  assessment/livesession/certificate/progress/notification/ai keys).
- Seed grant of Phase 3 permissions to operational roles: pending (`seed.phase3.ts`
  to be added in continuation, mirroring phase2/2b seeds).

## Tests
- `ai/adapters/local-ai.adapter.spec.ts` (provider-independence + safe ranking).
- Plus prior specs unchanged.

## Last generated file
`PHASE3_PROGRESS.md`. Prior: notification-channels module, AI module, live-sessions module, curriculum module, migration 0000000000003.

## Next recommended step
Build the remaining schema-ready modules (Resources/Files, Notes, Assignments,
Assessments/Quizzes, Student Progress, Certificates), add `seed.phase3.ts` for
permission grants, and add self-scope enforcement so actor self-service (student
notes/assignments, tutor courses) can be safely granted. Then wire a real AI and
video provider adapter behind the existing ports when those PTDs are logged.
