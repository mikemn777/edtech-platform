-- =====================================================================
-- Phase 2 migration — Core Marketplace Foundation (actor domains).
-- Additive only; Phase 1 tables are untouched (Database Master Architecture
-- §22-23 governed, forward-only migration). FKs to Phase 1 tables
-- (user_account, currency) are enforced here at the DB level even though the
-- Prisma models declare them as scalar references (to keep Phase 1 models intact).
-- =====================================================================

-- ---------- Enums ----------
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REVOKED');
CREATE TYPE "VerificationCaseStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'REVOKED');
CREATE TYPE "OfferingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');
CREATE TYPE "AvailabilityStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- ---------- student_profile ----------
CREATE TABLE "student_profile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "date_of_birth" DATE,
  "is_minor" BOOLEAN NOT NULL DEFAULT true,
  "learning_context" JSONB,
  "jurisdiction_id" UUID,
  "classification" TEXT NOT NULL DEFAULT 'minor_related',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "student_profile_pkey" PRIMARY KEY ("id")
);

-- ---------- parent_profile ----------
CREATE TABLE "parent_profile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "oversight_context" JSONB,
  "classification" TEXT NOT NULL DEFAULT 'personal',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "parent_profile_pkey" PRIMARY KEY ("id")
);

-- ---------- tutor_profile ----------
CREATE TABLE "tutor_profile" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "headline" TEXT,
  "bio" TEXT,
  "verification_status" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
  "jurisdiction_id" UUID,
  "rating_average" DECIMAL(3,2),
  "rating_count" INTEGER NOT NULL DEFAULT 0,
  "classification" TEXT NOT NULL DEFAULT 'personal',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "tutor_profile_pkey" PRIMARY KEY ("id")
);

-- ---------- tutor_offering ----------
CREATE TABLE "tutor_offering" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" UUID NOT NULL,
  "subject" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "base_price" DECIMAL(18,4),
  "currency_id" UUID,
  "status" "OfferingStatus" NOT NULL DEFAULT 'DRAFT',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "tutor_offering_pkey" PRIMARY KEY ("id")
);

-- ---------- tutor_availability ----------
CREATE TABLE "tutor_availability" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" UUID NOT NULL,
  "start_at" TIMESTAMPTZ(6) NOT NULL,
  "end_at" TIMESTAMPTZ(6) NOT NULL,
  "recurrence" JSONB,
  "status" "AvailabilityStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "tutor_availability_pkey" PRIMARY KEY ("id")
);

-- ---------- verification_case ----------
CREATE TABLE "verification_case" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" UUID NOT NULL,
  "status" "VerificationCaseStatus" NOT NULL DEFAULT 'OPEN',
  "jurisdiction_id" UUID,
  "opened_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "decided_at" TIMESTAMPTZ(6),
  "decided_by" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "verification_case_pkey" PRIMARY KEY ("id")
);

-- ---------- verification_check ----------
CREATE TABLE "verification_check" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL,
  "check_type" TEXT NOT NULL,
  "outcome" TEXT NOT NULL DEFAULT 'pending',
  "performed_at" TIMESTAMPTZ(6),
  "classification" TEXT NOT NULL DEFAULT 'personal',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "verification_check_pkey" PRIMARY KEY ("id")
);

-- ---------- Unique indexes ----------
CREATE UNIQUE INDEX "student_profile_account_id_key" ON "student_profile"("account_id");
CREATE UNIQUE INDEX "parent_profile_account_id_key" ON "parent_profile"("account_id");
CREATE UNIQUE INDEX "tutor_profile_account_id_key" ON "tutor_profile"("account_id");

-- ---------- Secondary indexes ----------
CREATE INDEX "student_profile_account_id_idx" ON "student_profile"("account_id");
CREATE INDEX "student_profile_jurisdiction_id_idx" ON "student_profile"("jurisdiction_id");
CREATE INDEX "student_profile_is_deleted_idx" ON "student_profile"("is_deleted");
CREATE INDEX "parent_profile_account_id_idx" ON "parent_profile"("account_id");
CREATE INDEX "tutor_profile_account_id_idx" ON "tutor_profile"("account_id");
CREATE INDEX "tutor_profile_verification_status_idx" ON "tutor_profile"("verification_status");
CREATE INDEX "tutor_profile_jurisdiction_id_idx" ON "tutor_profile"("jurisdiction_id");
CREATE INDEX "tutor_profile_is_deleted_idx" ON "tutor_profile"("is_deleted");
CREATE INDEX "tutor_offering_tutor_id_idx" ON "tutor_offering"("tutor_id");
CREATE INDEX "tutor_offering_subject_idx" ON "tutor_offering"("subject");
CREATE INDEX "tutor_offering_status_idx" ON "tutor_offering"("status");
CREATE INDEX "tutor_availability_tutor_id_idx" ON "tutor_availability"("tutor_id");
CREATE INDEX "tutor_availability_start_at_end_at_idx" ON "tutor_availability"("start_at", "end_at");
CREATE INDEX "tutor_availability_status_idx" ON "tutor_availability"("status");
CREATE INDEX "verification_case_tutor_id_idx" ON "verification_case"("tutor_id");
CREATE INDEX "verification_case_status_idx" ON "verification_case"("status");
CREATE INDEX "verification_case_jurisdiction_id_idx" ON "verification_case"("jurisdiction_id");
CREATE INDEX "verification_check_case_id_idx" ON "verification_check"("case_id");
CREATE INDEX "verification_check_check_type_outcome_idx" ON "verification_check"("check_type", "outcome");

-- ---------- Foreign keys ----------
ALTER TABLE "student_profile" ADD CONSTRAINT "student_profile_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "parent_profile" ADD CONSTRAINT "parent_profile_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_profile" ADD CONSTRAINT "tutor_profile_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_offering" ADD CONSTRAINT "tutor_offering_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_offering" ADD CONSTRAINT "tutor_offering_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tutor_availability" ADD CONSTRAINT "tutor_availability_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "verification_case" ADD CONSTRAINT "verification_case_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "verification_check" ADD CONSTRAINT "verification_check_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "verification_case"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
