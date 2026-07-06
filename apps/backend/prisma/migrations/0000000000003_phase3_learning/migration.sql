-- =====================================================================
-- Phase 3 migration — Learning Delivery, Communication, Intelligence.
-- Additive only; prior tables untouched (DB Arch §22-23). FKs to prior tables
-- enforced at DB level (models use scalar references).
-- =====================================================================

CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED');
CREATE TYPE "EnrollableType" AS ENUM ('COURSE', 'PROGRAM', 'PATH');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'WITHDRAWN');
CREATE TYPE "AssignmentStatus" AS ENUM ('OPEN', 'SUBMITTED', 'GRADED', 'CLOSED');
CREATE TYPE "AssessmentKind" AS ENUM ('ASSESSMENT', 'QUIZ');
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'TEXT');
CREATE TYPE "LiveSessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'NO_SHOW', 'CANCELLED');
CREATE TYPE "CertificateStatus" AS ENUM ('ISSUED', 'REVOKED');
CREATE TYPE "AICapability" AS ENUM ('ASSISTANT', 'RECOMMENDATION');

-- Helper note: every table carries the standard audit + soft-delete columns.

CREATE TABLE "course" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "title" TEXT NOT NULL, "description" TEXT, "subject" TEXT NOT NULL, "owner_account_id" UUID NOT NULL, "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT', "jurisdiction_id" UUID, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "course_pkey" PRIMARY KEY ("id"));
CREATE TABLE "course_module" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "course_id" UUID NOT NULL, "title" TEXT NOT NULL, "sequence_order" INTEGER NOT NULL, "content_ref" TEXT, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "course_module_pkey" PRIMARY KEY ("id"));
CREATE TABLE "program" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "title" TEXT NOT NULL, "description" TEXT, "owner_account_id" UUID NOT NULL, "educational_system_id" UUID, "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "program_pkey" PRIMARY KEY ("id"));
CREATE TABLE "program_course" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "program_id" UUID NOT NULL, "course_id" UUID NOT NULL, "sequence_order" INTEGER NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "program_course_pkey" PRIMARY KEY ("id"));
CREATE TABLE "learning_path" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "title" TEXT NOT NULL, "description" TEXT, "owner_account_id" UUID NOT NULL, "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "learning_path_pkey" PRIMARY KEY ("id"));
CREATE TABLE "learning_path_step" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "path_id" UUID NOT NULL, "ref_type" TEXT NOT NULL, "ref_id" UUID, "title" TEXT NOT NULL, "sequence_order" INTEGER NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "learning_path_step_pkey" PRIMARY KEY ("id"));
CREATE TABLE "enrollment" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "student_id" UUID NOT NULL, "enrollable_type" "EnrollableType" NOT NULL, "enrollable_id" UUID NOT NULL, "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE', "enrolled_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "classification" TEXT NOT NULL DEFAULT 'minor_related', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "enrollment_pkey" PRIMARY KEY ("id"));
CREATE TABLE "resource" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "owner_account_id" UUID NOT NULL, "title" TEXT NOT NULL, "description" TEXT, "storage_reference" TEXT NOT NULL, "content_type" TEXT NOT NULL, "course_id" UUID, "classification" TEXT NOT NULL DEFAULT 'operational', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "resource_pkey" PRIMARY KEY ("id"));
CREATE TABLE "note" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "author_account_id" UUID NOT NULL, "title" TEXT, "body" TEXT NOT NULL, "context_type" TEXT, "context_id" UUID, "classification" TEXT NOT NULL DEFAULT 'personal', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "note_pkey" PRIMARY KEY ("id"));
CREATE TABLE "assignment" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "title" TEXT NOT NULL, "description" TEXT, "course_id" UUID, "assigned_by_account_id" UUID NOT NULL, "student_id" UUID NOT NULL, "due_at" TIMESTAMPTZ(6), "status" "AssignmentStatus" NOT NULL DEFAULT 'OPEN', "classification" TEXT NOT NULL DEFAULT 'minor_related', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "assignment_pkey" PRIMARY KEY ("id"));
CREATE TABLE "assignment_submission" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "assignment_id" UUID NOT NULL, "student_id" UUID NOT NULL, "submitted_at" TIMESTAMPTZ(6), "content_reference" TEXT, "status" TEXT NOT NULL DEFAULT 'draft', "feedback" TEXT, "score" DECIMAL(18,4), "classification" TEXT NOT NULL DEFAULT 'minor_related', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "assignment_submission_pkey" PRIMARY KEY ("id"));
CREATE TABLE "assessment" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "title" TEXT NOT NULL, "owner_account_id" UUID NOT NULL, "kind" "AssessmentKind" NOT NULL DEFAULT 'ASSESSMENT', "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT', "course_id" UUID, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "assessment_pkey" PRIMARY KEY ("id"));
CREATE TABLE "assessment_question" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "assessment_id" UUID NOT NULL, "prompt" TEXT NOT NULL, "question_type" "QuestionType" NOT NULL, "options" JSONB, "answer_key" JSONB, "points" INTEGER NOT NULL DEFAULT 1, "sequence_order" INTEGER NOT NULL, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "assessment_question_pkey" PRIMARY KEY ("id"));
CREATE TABLE "assessment_submission" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "assessment_id" UUID NOT NULL, "student_id" UUID NOT NULL, "submitted_at" TIMESTAMPTZ(6), "status" TEXT NOT NULL DEFAULT 'in_progress', "score" DECIMAL(18,4), "max_score" DECIMAL(18,4), "classification" TEXT NOT NULL DEFAULT 'minor_related', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "assessment_submission_pkey" PRIMARY KEY ("id"));
CREATE TABLE "assessment_answer" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "submission_id" UUID NOT NULL, "question_id" UUID NOT NULL, "answer" JSONB, "is_correct" BOOLEAN, "awarded_points" INTEGER, "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "assessment_answer_pkey" PRIMARY KEY ("id"));
CREATE TABLE "live_session" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "booking_id" UUID, "tutor_id" UUID NOT NULL, "student_id" UUID NOT NULL, "scheduled_start" TIMESTAMPTZ(6) NOT NULL, "scheduled_end" TIMESTAMPTZ(6) NOT NULL, "actual_start" TIMESTAMPTZ(6), "actual_end" TIMESTAMPTZ(6), "status" "LiveSessionStatus" NOT NULL DEFAULT 'SCHEDULED', "media_reference" TEXT, "classification" TEXT NOT NULL DEFAULT 'minor_related', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "live_session_pkey" PRIMARY KEY ("id"));
CREATE TABLE "session_attendance" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "session_id" UUID NOT NULL, "participant_account_id" UUID NOT NULL, "joined_at" TIMESTAMPTZ(6), "left_at" TIMESTAMPTZ(6), "attendance_status" TEXT NOT NULL DEFAULT 'absent', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "session_attendance_pkey" PRIMARY KEY ("id"));
CREATE TABLE "certificate" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "student_id" UUID NOT NULL, "title" TEXT NOT NULL, "issued_for_type" TEXT NOT NULL, "issued_for_id" UUID, "serial_number" TEXT NOT NULL, "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "status" "CertificateStatus" NOT NULL DEFAULT 'ISSUED', "classification" TEXT NOT NULL DEFAULT 'minor_related', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "certificate_pkey" PRIMARY KEY ("id"));
CREATE TABLE "ai_interaction" ("id" UUID NOT NULL DEFAULT gen_random_uuid(), "requestor_account_id" UUID NOT NULL, "capability" "AICapability" NOT NULL, "provider_key" TEXT, "context_reference" TEXT, "status" TEXT NOT NULL DEFAULT 'completed', "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "classification" TEXT NOT NULL DEFAULT 'personal', "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(), "created_by" UUID, "updated_by" UUID, "is_deleted" BOOLEAN NOT NULL DEFAULT false, "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID, "record_version" INTEGER NOT NULL DEFAULT 1, CONSTRAINT "ai_interaction_pkey" PRIMARY KEY ("id"));

-- ---------- Unique indexes ----------
CREATE UNIQUE INDEX "course_module_course_id_sequence_order_key" ON "course_module"("course_id", "sequence_order");
CREATE UNIQUE INDEX "program_course_program_id_sequence_order_key" ON "program_course"("program_id", "sequence_order");
CREATE UNIQUE INDEX "learning_path_step_path_id_sequence_order_key" ON "learning_path_step"("path_id", "sequence_order");
CREATE UNIQUE INDEX "enrollment_student_id_enrollable_type_enrollable_id_key" ON "enrollment"("student_id", "enrollable_type", "enrollable_id");
CREATE UNIQUE INDEX "assessment_question_assessment_id_sequence_order_key" ON "assessment_question"("assessment_id", "sequence_order");
CREATE UNIQUE INDEX "assessment_answer_submission_id_question_id_key" ON "assessment_answer"("submission_id", "question_id");
CREATE UNIQUE INDEX "session_attendance_session_id_participant_account_id_key" ON "session_attendance"("session_id", "participant_account_id");
CREATE UNIQUE INDEX "certificate_serial_number_key" ON "certificate"("serial_number");

-- ---------- Secondary indexes ----------
CREATE INDEX "course_owner_account_id_idx" ON "course"("owner_account_id");
CREATE INDEX "course_subject_idx" ON "course"("subject");
CREATE INDEX "course_status_idx" ON "course"("status");
CREATE INDEX "course_module_course_id_idx" ON "course_module"("course_id");
CREATE INDEX "program_owner_account_id_idx" ON "program"("owner_account_id");
CREATE INDEX "program_status_idx" ON "program"("status");
CREATE INDEX "program_course_program_id_idx" ON "program_course"("program_id");
CREATE INDEX "program_course_course_id_idx" ON "program_course"("course_id");
CREATE INDEX "learning_path_owner_account_id_idx" ON "learning_path"("owner_account_id");
CREATE INDEX "learning_path_step_path_id_idx" ON "learning_path_step"("path_id");
CREATE INDEX "enrollment_student_id_idx" ON "enrollment"("student_id");
CREATE INDEX "enrollment_enrollable_type_enrollable_id_idx" ON "enrollment"("enrollable_type", "enrollable_id");
CREATE INDEX "resource_owner_account_id_idx" ON "resource"("owner_account_id");
CREATE INDEX "resource_course_id_idx" ON "resource"("course_id");
CREATE INDEX "note_author_account_id_idx" ON "note"("author_account_id");
CREATE INDEX "note_context_type_context_id_idx" ON "note"("context_type", "context_id");
CREATE INDEX "assignment_student_id_idx" ON "assignment"("student_id");
CREATE INDEX "assignment_course_id_idx" ON "assignment"("course_id");
CREATE INDEX "assignment_status_idx" ON "assignment"("status");
CREATE INDEX "assignment_submission_assignment_id_idx" ON "assignment_submission"("assignment_id");
CREATE INDEX "assignment_submission_student_id_idx" ON "assignment_submission"("student_id");
CREATE INDEX "assessment_owner_account_id_idx" ON "assessment"("owner_account_id");
CREATE INDEX "assessment_kind_idx" ON "assessment"("kind");
CREATE INDEX "assessment_status_idx" ON "assessment"("status");
CREATE INDEX "assessment_question_assessment_id_idx" ON "assessment_question"("assessment_id");
CREATE INDEX "assessment_submission_assessment_id_idx" ON "assessment_submission"("assessment_id");
CREATE INDEX "assessment_submission_student_id_idx" ON "assessment_submission"("student_id");
CREATE INDEX "assessment_answer_submission_id_idx" ON "assessment_answer"("submission_id");
CREATE INDEX "live_session_tutor_id_idx" ON "live_session"("tutor_id");
CREATE INDEX "live_session_student_id_idx" ON "live_session"("student_id");
CREATE INDEX "live_session_status_scheduled_start_idx" ON "live_session"("status", "scheduled_start");
CREATE INDEX "session_attendance_session_id_idx" ON "session_attendance"("session_id");
CREATE INDEX "certificate_student_id_idx" ON "certificate"("student_id");
CREATE INDEX "certificate_issued_for_type_issued_for_id_idx" ON "certificate"("issued_for_type", "issued_for_id");
CREATE INDEX "ai_interaction_requestor_account_id_idx" ON "ai_interaction"("requestor_account_id");
CREATE INDEX "ai_interaction_capability_occurred_at_idx" ON "ai_interaction"("capability", "occurred_at");

-- ---------- Foreign keys ----------
ALTER TABLE "course" ADD CONSTRAINT "course_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "course_module" ADD CONSTRAINT "course_module_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "program" ADD CONSTRAINT "program_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "program_course" ADD CONSTRAINT "program_course_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "program_course" ADD CONSTRAINT "program_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learning_path" ADD CONSTRAINT "learning_path_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learning_path_step" ADD CONSTRAINT "learning_path_step_path_id_fkey" FOREIGN KEY ("path_id") REFERENCES "learning_path"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollment" ADD CONSTRAINT "enrollment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resource" ADD CONSTRAINT "resource_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "resource" ADD CONSTRAINT "resource_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "note" ADD CONSTRAINT "note_author_account_id_fkey" FOREIGN KEY ("author_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_assigned_by_account_id_fkey" FOREIGN KEY ("assigned_by_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assignment_submission" ADD CONSTRAINT "assignment_submission_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_owner_account_id_fkey" FOREIGN KEY ("owner_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "assessment_question" ADD CONSTRAINT "assessment_question_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment_submission" ADD CONSTRAINT "assessment_submission_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "assessment_answer" ADD CONSTRAINT "assessment_answer_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "assessment_submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "live_session" ADD CONSTRAINT "live_session_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "session_attendance" ADD CONSTRAINT "session_attendance_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "live_session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "certificate" ADD CONSTRAINT "certificate_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ai_interaction" ADD CONSTRAINT "ai_interaction_requestor_account_id_fkey" FOREIGN KEY ("requestor_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
