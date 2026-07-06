-- =====================================================================
-- Phase 2b migration — Core Business Platform (catalog, learning, favorites,
-- booking). Additive only; prior tables untouched (DB Arch §22-23). FKs to
-- prior tables enforced here at DB level (models use scalar references).
-- =====================================================================

CREATE TYPE "BookingStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED');
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'ACHIEVED', 'ABANDONED');
CREATE TYPE "RateUnit" AS ENUM ('PER_HOUR', 'PER_SESSION');

-- ---------- tutor_subject ----------
CREATE TABLE "tutor_subject" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" UUID NOT NULL,
  "subject" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "tutor_subject_pkey" PRIMARY KEY ("id")
);

-- ---------- tutor_language ----------
CREATE TABLE "tutor_language" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" UUID NOT NULL,
  "language_id" UUID NOT NULL,
  "proficiency" TEXT NOT NULL DEFAULT 'fluent',
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "tutor_language_pkey" PRIMARY KEY ("id")
);

-- ---------- tutor_rate ----------
CREATE TABLE "tutor_rate" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tutor_id" UUID NOT NULL,
  "rate" DECIMAL(18,4) NOT NULL,
  "currency_id" UUID NOT NULL,
  "unit" "RateUnit" NOT NULL DEFAULT 'PER_HOUR',
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "tutor_rate_pkey" PRIMARY KEY ("id")
);

-- ---------- learning_goal ----------
CREATE TABLE "learning_goal" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "target_date" DATE,
  "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
  "classification" TEXT NOT NULL DEFAULT 'minor_related',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "learning_goal_pkey" PRIMARY KEY ("id")
);

-- ---------- progress_record ----------
CREATE TABLE "progress_record" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "goal_id" UUID,
  "metric_key" TEXT NOT NULL,
  "value" DECIMAL(18,4),
  "note" TEXT,
  "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "classification" TEXT NOT NULL DEFAULT 'minor_related',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "progress_record_pkey" PRIMARY KEY ("id")
);

-- ---------- favorite ----------
CREATE TABLE "favorite" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_account_id" UUID NOT NULL,
  "tutor_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- ---------- booking ----------
CREATE TABLE "booking" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "student_id" UUID NOT NULL,
  "tutor_id" UUID NOT NULL,
  "offering_id" UUID,
  "availability_id" UUID,
  "booked_by_account_id" UUID NOT NULL,
  "scheduled_start" TIMESTAMPTZ(6) NOT NULL,
  "scheduled_end" TIMESTAMPTZ(6) NOT NULL,
  "status" "BookingStatus" NOT NULL DEFAULT 'REQUESTED',
  "price" DECIMAL(18,4),
  "currency_id" UUID,
  "jurisdiction_id" UUID,
  "classification" TEXT NOT NULL DEFAULT 'minor_related',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- ---------- booking_status_history ----------
CREATE TABLE "booking_status_history" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "booking_id" UUID NOT NULL,
  "from_status" "BookingStatus",
  "to_status" "BookingStatus" NOT NULL,
  "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "changed_by" UUID,
  "reason" TEXT,
  CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- ---------- Unique indexes ----------
CREATE UNIQUE INDEX "tutor_subject_tutor_id_subject_key" ON "tutor_subject"("tutor_id", "subject");
CREATE UNIQUE INDEX "tutor_language_tutor_id_language_id_key" ON "tutor_language"("tutor_id", "language_id");
CREATE UNIQUE INDEX "favorite_student_account_id_tutor_id_key" ON "favorite"("student_account_id", "tutor_id");

-- ---------- Secondary indexes ----------
CREATE INDEX "tutor_subject_tutor_id_idx" ON "tutor_subject"("tutor_id");
CREATE INDEX "tutor_subject_subject_idx" ON "tutor_subject"("subject");
CREATE INDEX "tutor_language_tutor_id_idx" ON "tutor_language"("tutor_id");
CREATE INDEX "tutor_language_language_id_idx" ON "tutor_language"("language_id");
CREATE INDEX "tutor_rate_tutor_id_idx" ON "tutor_rate"("tutor_id");
CREATE INDEX "learning_goal_student_id_idx" ON "learning_goal"("student_id");
CREATE INDEX "learning_goal_status_idx" ON "learning_goal"("status");
CREATE INDEX "progress_record_student_id_idx" ON "progress_record"("student_id");
CREATE INDEX "progress_record_goal_id_idx" ON "progress_record"("goal_id");
CREATE INDEX "favorite_student_account_id_idx" ON "favorite"("student_account_id");
CREATE INDEX "favorite_tutor_id_idx" ON "favorite"("tutor_id");
CREATE INDEX "booking_student_id_idx" ON "booking"("student_id");
CREATE INDEX "booking_tutor_id_idx" ON "booking"("tutor_id");
CREATE INDEX "booking_status_idx" ON "booking"("status");
CREATE INDEX "booking_tutor_id_status_idx" ON "booking"("tutor_id", "status");
CREATE INDEX "booking_scheduled_start_idx" ON "booking"("scheduled_start");
CREATE INDEX "booking_status_history_booking_id_idx" ON "booking_status_history"("booking_id");
CREATE INDEX "booking_status_history_booking_id_changed_at_idx" ON "booking_status_history"("booking_id", "changed_at");

-- ---------- Foreign keys (to prior + new tables) ----------
ALTER TABLE "tutor_subject" ADD CONSTRAINT "tutor_subject_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_language" ADD CONSTRAINT "tutor_language_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_language" ADD CONSTRAINT "tutor_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_rate" ADD CONSTRAINT "tutor_rate_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "tutor_rate" ADD CONSTRAINT "tutor_rate_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "learning_goal" ADD CONSTRAINT "learning_goal_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "progress_record" ADD CONSTRAINT "progress_record_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "progress_record" ADD CONSTRAINT "progress_record_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "learning_goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_student_account_id_fkey" FOREIGN KEY ("student_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking" ADD CONSTRAINT "booking_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking" ADD CONSTRAINT "booking_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutor_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking" ADD CONSTRAINT "booking_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "tutor_offering"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "booking" ADD CONSTRAINT "booking_availability_id_fkey" FOREIGN KEY ("availability_id") REFERENCES "tutor_availability"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "booking" ADD CONSTRAINT "booking_booked_by_account_id_fkey" FOREIGN KEY ("booked_by_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking" ADD CONSTRAINT "booking_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
