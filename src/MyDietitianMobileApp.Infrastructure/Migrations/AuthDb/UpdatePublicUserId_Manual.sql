-- Manual SQL to upgrade PublicUserId format from MD-XXXXXX to MD-XXXX-XXXX-XX
-- Run this in PostgreSQL if EF migration fails

-- Check current format
SELECT "PublicUserId", LENGTH("PublicUserId") as length 
FROM "UserAccounts" 
WHERE "PublicUserId" IS NOT NULL
LIMIT 5;

-- Update to new format (MD-XXXX-XXXX-XX)
UPDATE "UserAccounts"
SET "PublicUserId" = CONCAT(
    'MD-',
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || "Id"::TEXT || '1') FROM 1 FOR 4)),
    '-',
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || "Email"::TEXT || '2') FROM 1 FOR 4)),
    '-',
    UPPER(SUBSTRING(MD5(RANDOM()::TEXT || "Id"::TEXT || '3') FROM 1 FOR 2))
)
WHERE LENGTH("PublicUserId") < 15;

-- Verify new format
SELECT "PublicUserId", "Email" 
FROM "UserAccounts" 
WHERE "PublicUserId" IS NOT NULL
LIMIT 10;

-- Check for duplicates (should be 0)
SELECT "PublicUserId", COUNT(*) 
FROM "UserAccounts" 
GROUP BY "PublicUserId" 
HAVING COUNT(*) > 1;
