-- Enable extensions required by the platform.
-- pgcrypto provides gen_random_uuid() for globally-unique, non-sequential keys
-- (Database Master Architecture §7 — UUID strategy).
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
