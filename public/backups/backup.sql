-- Indexes for profiles
CREATE INDEX IF NOT EXISTS "idx_profiles_email" ON "profiles" ("email");
CREATE INDEX IF NOT EXISTS "idx_profiles_referral_code" ON "profiles" ("referral_code");
CREATE INDEX IF NOT EXISTS "idx_profiles_username" ON "profiles" ("username");
CREATE INDEX IF NOT EXISTS "profiles_email_key" ON "profiles" ("email");
CREATE INDEX IF NOT EXISTS "profiles_referral_code_key" ON "profiles" ("referral_code");
CREATE INDEX IF NOT EXISTS "profiles_username_key" ON "profiles" ("username");
