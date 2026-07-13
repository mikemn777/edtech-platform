-- P0-2 (Production Readiness Review, Finding B1): plain unique indexes/constraints
-- ignore is_deleted, so soft-deleting then recreating a record permanently collides
-- with the soft-deleted row. Convert the confirmed-live-bug cases to PARTIAL unique
-- indexes that only enforce uniqueness among LIVE (is_deleted = false) rows.
--
-- Prisma's schema.prisma DSL cannot express a partial index, so these are managed
-- here as a hand-authored migration; schema.prisma documents this next to each
-- affected field/model and no longer declares @unique/@@unique for them.

-- identity.primary_email / primary_phone
DROP INDEX IF EXISTS "identity_primary_email_key";
CREATE UNIQUE INDEX "identity_primary_email_active_key" ON "identity" ("primary_email") WHERE "is_deleted" = false;

DROP INDEX IF EXISTS "identity_primary_phone_key";
CREATE UNIQUE INDEX "identity_primary_phone_active_key" ON "identity" ("primary_phone") WHERE "is_deleted" = false;

-- student_profile.account_id
DROP INDEX IF EXISTS "student_profile_account_id_key";
CREATE UNIQUE INDEX "student_profile_account_id_active_key" ON "student_profile" ("account_id") WHERE "is_deleted" = false;

-- parent_profile.account_id
DROP INDEX IF EXISTS "parent_profile_account_id_key";
CREATE UNIQUE INDEX "parent_profile_account_id_active_key" ON "parent_profile" ("account_id") WHERE "is_deleted" = false;

-- tutor_profile.account_id
DROP INDEX IF EXISTS "tutor_profile_account_id_key";
CREATE UNIQUE INDEX "tutor_profile_account_id_active_key" ON "tutor_profile" ("account_id") WHERE "is_deleted" = false;

-- account_relationship (from_account_id, to_account_id, relationship_type)
DROP INDEX IF EXISTS "account_relationship_from_account_id_to_account_id_relations_ke";
CREATE UNIQUE INDEX "account_relationship_active_key" ON "account_relationship" ("from_account_id", "to_account_id", "relationship_type") WHERE "is_deleted" = false;
