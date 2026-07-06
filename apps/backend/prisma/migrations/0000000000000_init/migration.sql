-- =====================================================================
-- Initial migration (module 26) — Phase 1 foundation.
-- Hand-authored to mirror Prisma's canonical DDL from schema.prisma so that
-- `prisma migrate deploy` applies it and `prisma migrate dev` detects no drift.
-- Conforms to Database Master Architecture v1.0 (UUID keys, audit fields,
-- soft delete, timestamptz, configurable references).
-- =====================================================================

-- Required for gen_random_uuid() on older engines (no-op on PG13+ with pgcrypto).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ---------- Enums ----------
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');
CREATE TYPE "IdentityStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'LOCKED');
CREATE TYPE "RoleFamily" AS ENUM ('OPERATIONAL', 'ACTOR');
CREATE TYPE "PermissionScope" AS ENUM ('SELF', 'RELATIONSHIP', 'JURISDICTION', 'PLATFORM');
CREATE TYPE "CredentialMethod" AS ENUM ('PASSWORD', 'OTP', 'FEDERATED');
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');
CREATE TYPE "CountryStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'INACTIVE');
CREATE TYPE "ConfigScope" AS ENUM ('PLATFORM', 'COUNTRY', 'JURISDICTION', 'ROLE', 'ACCOUNT');
CREATE TYPE "TextDirection" AS ENUM ('LTR', 'RTL');

-- ---------- Configuration backbone ----------
CREATE TABLE "currency" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "currency_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "minor_unit_scale" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "currency_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "language" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "language_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "direction" "TextDirection" NOT NULL DEFAULT 'LTR',
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "language_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "locale" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "locale_code" TEXT NOT NULL,
  "language_id" UUID NOT NULL,
  "region_country_id" UUID,
  "formatting_rules" JSONB,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "locale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "country" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "country_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "default_locale_id" UUID,
  "default_currency_id" UUID,
  "status" "CountryStatus" NOT NULL DEFAULT 'ONBOARDING',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jurisdiction" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "country_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "jurisdiction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "jurisdiction_attribute" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "jurisdiction_id" UUID NOT NULL,
  "attribute_key" TEXT NOT NULL,
  "attribute_value" JSONB,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "jurisdiction_attribute_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "translation_key" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key_name" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "translation_key_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "translation_value" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "translation_key_id" UUID NOT NULL,
  "language_id" UUID NOT NULL,
  "value" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "translation_value_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "configuration_version" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "version_label" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "activated_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "configuration_version_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "setting" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "setting_key" TEXT NOT NULL,
  "scope_type" "ConfigScope" NOT NULL,
  "scope_reference" UUID,
  "value" JSONB NOT NULL,
  "config_version_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "setting_pkey" PRIMARY KEY ("id")
);

-- ---------- Identity & Authentication ----------
CREATE TABLE "identity" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "primary_email" CITEXT,
  "primary_phone" TEXT,
  "status" "IdentityStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "identity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_credential" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "identity_id" UUID NOT NULL,
  "method" "CredentialMethod" NOT NULL,
  "secret_reference" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "expires_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "auth_credential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_session" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "identity_id" UUID NOT NULL,
  "refresh_token_hash" TEXT NOT NULL,
  "established_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "context" JSONB,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_event" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "identity_id" UUID,
  "event_type" TEXT NOT NULL,
  "outcome" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "context" JSONB,
  CONSTRAINT "auth_event_pkey" PRIMARY KEY ("id")
);

-- ---------- User Management & RBAC ----------
CREATE TABLE "user_account" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "identity_id" UUID NOT NULL,
  "display_name" TEXT NOT NULL,
  "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
  "primary_locale_id" UUID,
  "primary_jurisdiction_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "family" "RoleFamily" NOT NULL,
  "description" TEXT NOT NULL,
  "is_system_role" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "permission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "domain_area" TEXT NOT NULL,
  "sensitivity" TEXT NOT NULL DEFAULT 'normal',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "role_permission" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "role_id" UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account_role" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "account_id" UUID NOT NULL,
  "role_id" UUID NOT NULL,
  "scope_type" "PermissionScope" NOT NULL DEFAULT 'PLATFORM',
  "scope_reference" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "account_role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "account_relationship" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "from_account_id" UUID NOT NULL,
  "to_account_id" UUID NOT NULL,
  "relationship_type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "established_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "created_by" UUID, "updated_by" UUID,
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "deleted_at" TIMESTAMPTZ(6), "deleted_by" UUID,
  "record_version" INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT "account_relationship_pkey" PRIMARY KEY ("id")
);

-- ---------- Audit (append-only) ----------
CREATE TABLE "audit_record" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor_account_id" UUID,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_reference" UUID,
  "authority_context" JSONB,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "jurisdiction_id" UUID,
  "classification" TEXT NOT NULL DEFAULT 'operational',
  "correlation_id" TEXT,
  CONSTRAINT "audit_record_pkey" PRIMARY KEY ("id")
);

-- ---------- Unique indexes ----------
CREATE UNIQUE INDEX "currency_currency_code_key" ON "currency"("currency_code");
CREATE UNIQUE INDEX "language_language_code_key" ON "language"("language_code");
CREATE UNIQUE INDEX "locale_locale_code_key" ON "locale"("locale_code");
CREATE UNIQUE INDEX "country_country_code_key" ON "country"("country_code");
CREATE UNIQUE INDEX "jurisdiction_attribute_jurisdiction_id_attribute_key_key" ON "jurisdiction_attribute"("jurisdiction_id", "attribute_key");
CREATE UNIQUE INDEX "translation_key_key_name_key" ON "translation_key"("key_name");
CREATE UNIQUE INDEX "translation_value_translation_key_id_language_id_key" ON "translation_value"("translation_key_id", "language_id");
CREATE UNIQUE INDEX "setting_setting_key_scope_type_scope_reference_key" ON "setting"("setting_key", "scope_type", "scope_reference");
CREATE UNIQUE INDEX "identity_primary_email_key" ON "identity"("primary_email");
CREATE UNIQUE INDEX "identity_primary_phone_key" ON "identity"("primary_phone");
CREATE UNIQUE INDEX "user_account_identity_id_key" ON "user_account"("identity_id");
CREATE UNIQUE INDEX "role_name_key" ON "role"("name");
CREATE UNIQUE INDEX "permission_key_key" ON "permission"("key");
CREATE UNIQUE INDEX "role_permission_role_id_permission_id_key" ON "role_permission"("role_id", "permission_id");
CREATE UNIQUE INDEX "account_role_account_id_role_id_scope_type_scope_reference_key" ON "account_role"("account_id", "role_id", "scope_type", "scope_reference");
CREATE UNIQUE INDEX "account_relationship_from_account_id_to_account_id_relations_key" ON "account_relationship"("from_account_id", "to_account_id", "relationship_type");

-- ---------- Secondary indexes ----------
CREATE INDEX "currency_is_deleted_idx" ON "currency"("is_deleted");
CREATE INDEX "language_is_deleted_idx" ON "language"("is_deleted");
CREATE INDEX "locale_language_id_idx" ON "locale"("language_id");
CREATE INDEX "locale_is_deleted_idx" ON "locale"("is_deleted");
CREATE INDEX "country_status_idx" ON "country"("status");
CREATE INDEX "country_is_deleted_idx" ON "country"("is_deleted");
CREATE INDEX "jurisdiction_country_id_idx" ON "jurisdiction"("country_id");
CREATE INDEX "jurisdiction_is_deleted_idx" ON "jurisdiction"("is_deleted");
CREATE INDEX "jurisdiction_attribute_jurisdiction_id_idx" ON "jurisdiction_attribute"("jurisdiction_id");
CREATE INDEX "translation_value_language_id_idx" ON "translation_value"("language_id");
CREATE INDEX "setting_scope_type_scope_reference_idx" ON "setting"("scope_type", "scope_reference");
CREATE INDEX "identity_status_idx" ON "identity"("status");
CREATE INDEX "identity_is_deleted_idx" ON "identity"("is_deleted");
CREATE INDEX "auth_credential_identity_id_idx" ON "auth_credential"("identity_id");
CREATE INDEX "auth_credential_identity_id_method_idx" ON "auth_credential"("identity_id", "method");
CREATE INDEX "auth_session_identity_id_idx" ON "auth_session"("identity_id");
CREATE INDEX "auth_session_status_idx" ON "auth_session"("status");
CREATE INDEX "auth_session_expires_at_idx" ON "auth_session"("expires_at");
CREATE INDEX "auth_event_identity_id_idx" ON "auth_event"("identity_id");
CREATE INDEX "auth_event_event_type_occurred_at_idx" ON "auth_event"("event_type", "occurred_at");
CREATE INDEX "user_account_status_idx" ON "user_account"("status");
CREATE INDEX "user_account_primary_jurisdiction_id_idx" ON "user_account"("primary_jurisdiction_id");
CREATE INDEX "user_account_is_deleted_idx" ON "user_account"("is_deleted");
CREATE INDEX "permission_domain_area_idx" ON "permission"("domain_area");
CREATE INDEX "role_permission_permission_id_idx" ON "role_permission"("permission_id");
CREATE INDEX "account_role_account_id_idx" ON "account_role"("account_id");
CREATE INDEX "account_role_role_id_idx" ON "account_role"("role_id");
CREATE INDEX "account_relationship_from_account_id_idx" ON "account_relationship"("from_account_id");
CREATE INDEX "account_relationship_to_account_id_idx" ON "account_relationship"("to_account_id");
CREATE INDEX "audit_record_entity_type_entity_reference_idx" ON "audit_record"("entity_type", "entity_reference");
CREATE INDEX "audit_record_actor_account_id_occurred_at_idx" ON "audit_record"("actor_account_id", "occurred_at");
CREATE INDEX "audit_record_action_idx" ON "audit_record"("action");
CREATE INDEX "audit_record_occurred_at_idx" ON "audit_record"("occurred_at");

-- ---------- Foreign keys ----------
ALTER TABLE "locale" ADD CONSTRAINT "locale_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "locale" ADD CONSTRAINT "locale_region_country_id_fkey" FOREIGN KEY ("region_country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "country" ADD CONSTRAINT "country_default_locale_id_fkey" FOREIGN KEY ("default_locale_id") REFERENCES "locale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "country" ADD CONSTRAINT "country_default_currency_id_fkey" FOREIGN KEY ("default_currency_id") REFERENCES "currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "jurisdiction" ADD CONSTRAINT "jurisdiction_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jurisdiction_attribute" ADD CONSTRAINT "jurisdiction_attribute_jurisdiction_id_fkey" FOREIGN KEY ("jurisdiction_id") REFERENCES "jurisdiction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "translation_value" ADD CONSTRAINT "translation_value_translation_key_id_fkey" FOREIGN KEY ("translation_key_id") REFERENCES "translation_key"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "translation_value" ADD CONSTRAINT "translation_value_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "setting" ADD CONSTRAINT "setting_config_version_id_fkey" FOREIGN KEY ("config_version_id") REFERENCES "configuration_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "auth_credential" ADD CONSTRAINT "auth_credential_identity_id_fkey" FOREIGN KEY ("identity_id") REFERENCES "identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_identity_id_fkey" FOREIGN KEY ("identity_id") REFERENCES "identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "auth_event" ADD CONSTRAINT "auth_event_identity_id_fkey" FOREIGN KEY ("identity_id") REFERENCES "identity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_identity_id_fkey" FOREIGN KEY ("identity_id") REFERENCES "identity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_role" ADD CONSTRAINT "account_role_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_role" ADD CONSTRAINT "account_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_relationship" ADD CONSTRAINT "account_relationship_from_account_id_fkey" FOREIGN KEY ("from_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "account_relationship" ADD CONSTRAINT "account_relationship_to_account_id_fkey" FOREIGN KEY ("to_account_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
