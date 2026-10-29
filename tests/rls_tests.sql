-- Run after both migrations and seed.sql.
-- Run the entire script in the Supabase SQL Editor.

BEGIN;

CREATE TEMP TABLE test_results (
    test TEXT,
    passed BOOLEAN
);

GRANT INSERT ON test_results TO anon, authenticated, service_role;

-- 1. Anonymous visitor
SET LOCAL ROLE anon;

INSERT INTO test_results
SELECT 'Visitor sees only the approved listing',
    count(*) = 1 AND bool_and(is_approved)
FROM public.properties;

INSERT INTO test_results
SELECT 'Visitor sees only active sponsors',
    count(*) = 1 AND bool_and(is_active)
FROM public.sponsors;

INSERT INTO test_results
SELECT 'Visitor sees only the public sponsor link',
    count(*) = 1
FROM public.property_sponsors;

DO $$
BEGIN
    BEGIN
        INSERT INTO public.properties (owner_id, title, price)
        VALUES (
            '00000000-0000-4000-8000-000000000000',
            'Forbidden visitor listing', 100
        );
        INSERT INTO test_results
        VALUES ('Visitor cannot create listings', FALSE);
    EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO test_results
        VALUES ('Visitor cannot create listings', TRUE);
    END;

    BEGIN
        PERFORM id FROM public.inquiries;
        INSERT INTO test_results
        VALUES ('Visitor cannot read inquiries', FALSE);
    EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO test_results
        VALUES ('Visitor cannot read inquiries', TRUE);
    END;
END;
$$;

RESET ROLE;

-- 2. Signed-in owner
SELECT set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', id, 'role', 'authenticated'
    )::TEXT,
    TRUE
)
FROM auth.users WHERE email = 'owner@example.com';

SET LOCAL ROLE authenticated;

INSERT INTO test_results
SELECT 'Owner sees the approved listing and own draft',
    count(*) = 2
FROM public.properties;

WITH changed AS (
    UPDATE public.properties SET price = 1250
    WHERE id = '10000000-0000-4000-8000-000000000002'
    RETURNING id
)
INSERT INTO test_results
SELECT 'Owner can update own draft', count(*) = 1
FROM changed;

WITH changed AS (
    UPDATE public.properties SET price = 1600
    WHERE id = '10000000-0000-4000-8000-000000000001'
    RETURNING id
)
INSERT INTO test_results
SELECT 'Owner cannot update an approved listing', count(*) = 0
FROM changed;

DO $$
BEGIN
    BEGIN
        UPDATE public.properties SET is_approved = TRUE
        WHERE id = '10000000-0000-4000-8000-000000000002';
        INSERT INTO test_results
        VALUES ('Owner cannot approve a listing', FALSE);
    EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO test_results
        VALUES ('Owner cannot approve a listing', TRUE);
    END;
END;
$$;

INSERT INTO test_results
SELECT 'Owner cannot read another users inquiry', count(*) = 0
FROM public.inquiries;

RESET ROLE;

-- 3. Other signed-in user
SELECT set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', id, 'role', 'authenticated'
    )::TEXT,
    TRUE
)
FROM auth.users WHERE email = 'other@example.com';

SET LOCAL ROLE authenticated;

INSERT INTO test_results
SELECT 'Other user cannot see the owners draft', count(*) = 0
FROM public.properties
WHERE id = '10000000-0000-4000-8000-000000000002';

WITH changed AS (
    UPDATE public.properties SET price = 1
    WHERE id = '10000000-0000-4000-8000-000000000002'
    RETURNING id
)
INSERT INTO test_results
SELECT 'Other user cannot edit the owners draft', count(*) = 0
FROM changed;

INSERT INTO test_results
SELECT 'Other user can read own inquiry',
    count(*) = 1 AND bool_and(sender_id = auth.uid())
FROM public.inquiries;

INSERT INTO test_results
SELECT 'Other user can read only own profile',
    count(*) = 1 AND bool_and(id = auth.uid())
FROM public.profiles;

RESET ROLE;

-- 4. Server role
SET LOCAL ROLE service_role;

INSERT INTO test_results
SELECT 'Server role can read both listings', count(*) = 2
FROM public.properties;

WITH changed AS (
    UPDATE public.properties SET is_approved = TRUE
    WHERE id = '10000000-0000-4000-8000-000000000002'
    RETURNING id
)
INSERT INTO test_results
SELECT 'Server role can approve a listing', count(*) = 1
FROM changed;

RESET ROLE;

-- Every result should be TRUE.
SELECT test, passed FROM test_results ORDER BY test;

-- Undo all changes made during testing.
ROLLBACK;
