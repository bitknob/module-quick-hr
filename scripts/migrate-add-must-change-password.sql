-- Migration: Add mustChangePassword column to Users table
-- Date: 2026-01-16

ALTER TABLE "Users" 
ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN DEFAULT false;

-- Set existing users to not require password change
UPDATE "Users" SET "mustChangePassword" = false WHERE "mustChangePassword" IS NULL;
