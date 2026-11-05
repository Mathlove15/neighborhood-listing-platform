-- Development test data only.
-- Create owner@example.com and other@example.com in Authentication first.

BEGIN;

DO $$
DECLARE
    owner_uid UUID;
    other_uid UUID;
BEGIN
    SELECT id INTO owner_uid
    FROM auth.users WHERE email = 'owner@example.com';

    SELECT id INTO other_uid
    FROM auth.users WHERE email = 'other@example.com';

    IF owner_uid IS NULL OR other_uid IS NULL THEN
        RAISE EXCEPTION 'Create both test users before running this script.';
    END IF;

    INSERT INTO public.profiles (id, full_name)
    VALUES
        (owner_uid, 'Test Owner'),
        (other_uid, 'Test Other User')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.properties
        (id, owner_id, title, price, is_approved)
    VALUES
        ('10000000-0000-4000-8000-000000000001',
         owner_uid, 'Fictional Approved Apartment', 1500, TRUE),
        ('10000000-0000-4000-8000-000000000002',
         owner_uid, 'Fictional Draft Apartment', 1200, FALSE)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.sponsors (id, name, is_active)
    VALUES
        ('20000000-0000-4000-8000-000000000001',
         'Fictional Active Sponsor', TRUE),
        ('20000000-0000-4000-8000-000000000002',
         'Fictional Inactive Sponsor', FALSE)
    ON CONFLICT DO NOTHING;

    INSERT INTO public.property_sponsors (property_id, sponsor_id)
    VALUES
        ('10000000-0000-4000-8000-000000000001',
         '20000000-0000-4000-8000-000000000001'),
        ('10000000-0000-4000-8000-000000000001',
         '20000000-0000-4000-8000-000000000002'),
        ('10000000-0000-4000-8000-000000000002',
         '20000000-0000-4000-8000-000000000001')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.inquiries (id, property_id, sender_id, message)
    VALUES
        ('30000000-0000-4000-8000-000000000001',
         '10000000-0000-4000-8000-000000000001',
         other_uid, 'This is a fictional test inquiry.')
    ON CONFLICT DO NOTHING;
END;
$$;

COMMIT;
