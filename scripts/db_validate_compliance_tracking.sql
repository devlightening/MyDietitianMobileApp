-- ============================================
-- Compliance Tracking Schema Validation Script
-- ============================================
-- Purpose: Validate Phase 1 - Database schema
-- Usage: Run this in pgAdmin or psql after migration
-- ============================================

-- 1. VERIFY TABLES EXIST
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('DietPlans', 'DietDays', 'Meals', 'MealItems', 'MealItemCompliance', 'ComplianceScoreConfigs')
        THEN '✅ FOUND'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('DietPlans', 'DietDays', 'Meals', 'MealItems', 'MealItemCompliance', 'ComplianceScoreConfigs')
ORDER BY table_name;

-- 2. VERIFY CRITICAL INDEXES
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    -- Idempotent constraint (MOST CRITICAL)
    indexname = 'IX_MealItemCompliance_ClientId_MealItemId_DietDayId'
    -- Other important indexes
    OR indexname LIKE 'IX_MealItemCompliance_%'
    OR indexname LIKE 'IX_DietDays_DietPlanId_Date'
    OR indexname LIKE 'IX_DietPlans_%'
  )
ORDER BY tablename, indexname;

-- 3. VERIFY UNIQUE CONSTRAINT (Idempotent)
-- This should show as UNIQUE index
SELECT 
    i.relname as index_name,
    t.relname as table_name,
    CASE 
        WHEN idx.indisunique THEN '✅ UNIQUE'
        ELSE '⚠️ NOT UNIQUE'
    END as uniqueness,
    pg_get_indexdef(i.oid) as definition
FROM pg_class t
JOIN pg_index idx ON t.oid = idx.indrelid
JOIN pg_class i ON i.oid = idx.indexrelid
WHERE t.relname = 'MealItemCompliance'
  AND i.relname = 'IX_MealItemCompliance_ClientId_MealItemId_DietDayId';

-- 4. VERIFY FOREIGN KEYS
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    CASE
        WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE'
        WHEN rc.delete_rule = 'RESTRICT' THEN '✅ RESTRICT'
        ELSE '⚠️ ' || rc.delete_rule
    END as delete_strategy
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('DietDays', 'Meals', 'MealItems', 'MealItemCompliance')
ORDER BY tc.table_name, kcu.column_name;

-- 5. VERIFY COLUMN TYPES
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('DietPlans', 'DietDays', 'Meals', 'MealItems', 'MealItemCompliance', 'ComplianceScoreConfigs')
  AND (
    -- Key columns to verify
    column_name IN ('Id', 'Date', 'MarkedAt', 'ClientTimezoneOffsetMinutes', 'Status')
    OR column_name LIKE '%Id'
    OR column_name LIKE '%Date%'
  )
ORDER BY table_name, ordinal_position;

-- 6. TEST IDEMPOTENT CONSTRAINT (Requires sample data)
-- Uncomment and fill in GUIDs to test:
/*
-- First, you need sample data (Dietitian, Client, DietPlan, DietDay, Meal, MealItem)
-- Then test the constraint:

-- Should SUCCEED (first insert)
INSERT INTO "MealItemCompliance" (
    "Id", "ClientId", "DietPlanId", "DietDayId", "MealId", "MealItemId", 
    "IngredientId", "Status", "MarkedAt"
)
VALUES (
    gen_random_uuid(),
    'CLIENT_ID_HERE',
    'PLAN_ID_HERE',
    'DAY_ID_HERE',
    'MEAL_ID_HERE',
    'MEAL_ITEM_ID_HERE',
    'INGREDIENT_ID_HERE',
    1, -- Done
    NOW()
);

-- Should FAIL (duplicate - same ClientId + MealItemId + DietDayId)
INSERT INTO "MealItemCompliance" (
    "Id", "ClientId", "DietPlanId", "DietDayId", "MealId", "MealItemId", 
    "IngredientId", "Status", "MarkedAt"
)
VALUES (
    gen_random_uuid(), -- Different ID
    'CLIENT_ID_HERE',  -- SAME
    'PLAN_ID_HERE',    -- Can be different
    'DAY_ID_HERE',     -- SAME
    'MEAL_ID_HERE',    -- Can be different
    'MEAL_ITEM_ID_HERE', -- SAME
    'INGREDIENT_ID_HERE',
    1,
    NOW()
);
-- Expected: ERROR: duplicate key value violates unique constraint "IX_MealItemCompliance_ClientId_MealItemId_DietDayId"
*/

-- 7. VERIFY DEFAULT VALUES (ComplianceScoreConfig)
SELECT 
    column_name,
    column_default,
    CASE
        WHEN column_default LIKE '%10%' AND column_name = 'MandatoryDone' THEN '✅'
        WHEN column_default LIKE '%7%' AND column_name = 'MandatoryAlternative' THEN '✅'
        WHEN column_default LIKE '%3%' AND column_name = 'OptionalDone' THEN '✅'
        ELSE '⚠️'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ComplianceScoreConfigs'
  AND column_name IN ('MandatoryDone', 'MandatoryAlternative', 'OptionalDone')
ORDER BY column_name;

-- 8. SUMMARY
SELECT 
    'Schema Validation Complete' as summary,
    COUNT(DISTINCT table_name) as tables_found,
    COUNT(DISTINCT indexname) as indexes_found,
    COUNT(DISTINCT tc.constraint_name) as foreign_keys_found
FROM information_schema.tables t
LEFT JOIN pg_indexes idx ON t.table_name = idx.tablename
LEFT JOIN information_schema.table_constraints tc ON t.table_name = tc.table_name AND tc.constraint_type = 'FOREIGN KEY'
WHERE t.table_schema = 'public'
  AND t.table_name IN ('DietPlans', 'DietDays', 'Meals', 'MealItems', 'MealItemCompliance', 'ComplianceScoreConfigs');

