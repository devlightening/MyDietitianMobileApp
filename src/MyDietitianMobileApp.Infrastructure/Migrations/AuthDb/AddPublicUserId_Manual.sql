-- Add PublicUserId column to UserAccounts
ALTER TABLE "UserAccounts" 
ADD COLUMN "PublicUserId" VARCHAR(20);

-- Generate PublicUserId for existing users
-- Simple random alphanumeric generation using MD5
UPDATE "UserAccounts"
SET "PublicUserId" = 'MD-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || "Id"::TEXT) FROM 1 FOR 6))
WHERE "PublicUserId" IS NULL;

-- Make column NOT NULL
ALTER TABLE "UserAccounts" 
ALTER COLUMN "PublicUserId" SET NOT NULL;

-- Add unique index
CREATE UNIQUE INDEX "IX_UserAccounts_PublicUserId" 
ON "UserAccounts" ("PublicUserId");
