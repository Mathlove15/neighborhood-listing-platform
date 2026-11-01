-- Upgrade the Lab 5 schema for the midterm.
-- Run after 001_create_tables.sql and 002_access_policies.sql.
-- Existing fictional seed listings receive fictional specifications.
BEGIN;

-- Profiles: add application roles.
ALTER TABLE public.profiles
  ADD COLUMN role TEXT NOT NULL DEFAULT 'public'
    CHECK (role IN ('admin', 'property_owner', 'sponsor', 'public'));

UPDATE public.profiles AS p
SET role = 'property_owner'
WHERE EXISTS (
  SELECT 1 FROM public.properties AS property
  WHERE property.owner_id = p.id
);

-- Keep the legacy full_name field compatible with new inserts.
ALTER TABLE public.profiles
  ALTER COLUMN full_name SET DEFAULT 'Registered User';

-- Sponsors: use the exam column name and add tiers.
ALTER TABLE public.sponsors
  RENAME COLUMN is_active TO active_status;

-- Existing untiered fictional sponsors begin at bronze.
ALTER TABLE public.sponsors
  ADD COLUMN tier TEXT NOT NULL DEFAULT 'bronze'
    CHECK (tier IN ('gold', 'silver', 'bronze')),
  ADD CONSTRAINT sponsors_name_min_length
    CHECK (char_length(name) >= 2);

ALTER TABLE public.sponsors
  ALTER COLUMN tier DROP DEFAULT;

-- Properties: add the required listing fields.
ALTER TABLE public.properties
  ADD COLUMN address TEXT,
  ADD COLUMN bedrooms INTEGER CHECK (bedrooms >= 0),
  ADD COLUMN bathrooms NUMERIC(3, 1) CHECK (bathrooms >= 0),
  ADD COLUMN square_feet INTEGER CHECK (square_feet > 0),
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));

-- Preserve each existing listing's approval state.
UPDATE public.properties
SET status = CASE
  WHEN is_approved THEN 'approved'
  ELSE 'draft'
END;

-- These specifications belong only to the known fictional seed rows.
UPDATE public.properties
SET address = '123 Fictional Maple Street',
    bedrooms = 2,
    bathrooms = 1.0,
    square_feet = 900
WHERE id = '10000000-0000-4000-8000-000000000001';

UPDATE public.properties
SET address = '456 Fictional Oak Street',
    bedrooms = 1,
    bathrooms = 1.0,
    square_feet = 650
WHERE id = '10000000-0000-4000-8000-000000000002';

-- If other old listings lack these fields, stop instead of inventing data.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.properties
    WHERE address IS NULL
       OR bedrooms IS NULL
       OR bathrooms IS NULL
       OR square_feet IS NULL
  ) THEN
    RAISE EXCEPTION
      'Additional legacy listings need addresses and specifications before migration.';
  END IF;
END;
$$;

ALTER TABLE public.properties
  ALTER COLUMN address SET NOT NULL,
  ALTER COLUMN bedrooms SET NOT NULL,
  ALTER COLUMN bathrooms SET NOT NULL,
  ALTER COLUMN square_feet SET NOT NULL,
  ALTER COLUMN price TYPE NUMERIC(12, 2),
  ALTER COLUMN title SET DEFAULT 'Property listing';

-- Deleting an owner must not silently delete their properties.
ALTER TABLE public.properties
  DROP CONSTRAINT properties_owner_id_fkey,
  ADD CONSTRAINT properties_owner_id_fkey
    FOREIGN KEY (owner_id)
    REFERENCES public.profiles(id) ON DELETE RESTRICT;

-- Inquiries: allow anonymous submissions with an email address.
ALTER TABLE public.inquiries
  ALTER COLUMN sender_id DROP NOT NULL,
  ADD COLUMN inquirer_email TEXT;

-- Recover the email attached to each existing inquiry's sender.
UPDATE public.inquiries AS inquiry
SET inquirer_email = account.email
FROM auth.users AS account
WHERE account.id = inquiry.sender_id;

ALTER TABLE public.inquiries
  ALTER COLUMN inquirer_email SET NOT NULL,
  ADD CONSTRAINT inquiries_email_format
    CHECK (
      inquirer_email ~*
      '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
  ADD CONSTRAINT inquiries_message_min_length
    CHECK (char_length(message) >= 10);

-- TIMESTAMPTZ records an absolute instant regardless of display timezone.
ALTER TABLE public.profiles
  ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.sponsors
  ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.properties
  ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.property_sponsors
  ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.inquiries
  ALTER COLUMN created_at SET DEFAULT now();

-- Access rules and COMMIT will be appended next.

-- Replace the old Lab 5 policies.
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'properties', 'sponsors',
        'property_sponsors', 'inquiries'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END;
$$;

-- Keep row-level security enabled on every application table.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Clear existing table privileges.
REVOKE ALL ON TABLE
  public.profiles,
  public.properties,
  public.sponsors,
  public.property_sponsors,
  public.inquiries
FROM PUBLIC, anon, authenticated;

-- Column privileges from Lab 5 must also be removed explicitly.
REVOKE INSERT (id, full_name), UPDATE (full_name)
ON public.profiles FROM PUBLIC, anon, authenticated;

REVOKE INSERT (owner_id, title, price), UPDATE (title, price)
ON public.properties FROM PUBLIC, anon, authenticated;

REVOKE INSERT (property_id, sender_id, message)
ON public.inquiries FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public
TO anon, authenticated, service_role;

-- Users may read their own profile, but cannot change their role.
-- New profiles and role assignments are provisioned by trusted admins.
GRANT SELECT ON public.profiles TO authenticated;

CREATE POLICY exam_profiles_read_self
ON public.profiles FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

-- Public listing and sponsor access.
GRANT SELECT ON
  public.properties,
  public.sponsors,
  public.property_sponsors
TO anon, authenticated;

CREATE POLICY exam_properties_public
ON public.properties FOR SELECT TO anon, authenticated
USING (status = 'approved');

CREATE POLICY exam_sponsors_public
ON public.sponsors FOR SELECT TO anon, authenticated
USING (active_status = true);

CREATE POLICY exam_property_sponsors_public
ON public.property_sponsors FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties AS p
    WHERE p.id = property_sponsors.property_id
      AND p.status = 'approved'
  )
  AND EXISTS (
    SELECT 1 FROM public.sponsors AS s
    WHERE s.id = property_sponsors.sponsor_id
      AND s.active_status = true
  )
);

-- Owners may read their own listings, including private drafts.
CREATE POLICY exam_properties_owner_read
ON public.properties FOR SELECT TO authenticated
USING (
  owner_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'property_owner'
  )
);

-- Owners supply listing fields; IDs and timestamps use defaults.
GRANT INSERT (
  owner_id, address, price, bedrooms, bathrooms, square_feet
) ON public.properties TO authenticated;

CREATE POLICY exam_properties_owner_insert
ON public.properties FOR INSERT TO authenticated
WITH CHECK (
  owner_id = (SELECT auth.uid())
  AND status = 'draft'
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'property_owner'
  )
);

-- An owner can edit only an existing draft or rejected listing.
-- The updated record cannot become approved through owner access.
GRANT UPDATE (
  address, price, bedrooms, bathrooms, square_feet, status
) ON public.properties TO authenticated;

CREATE POLICY exam_properties_owner_update
ON public.properties FOR UPDATE TO authenticated
USING (
  owner_id = (SELECT auth.uid())
  AND status IN ('draft', 'rejected')
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'property_owner'
  )
)
WITH CHECK (
  owner_id = (SELECT auth.uid())
  AND status IN ('draft', 'pending', 'rejected')
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'property_owner'
  )
);

GRANT DELETE ON public.properties TO authenticated;

CREATE POLICY exam_properties_owner_delete
ON public.properties FOR DELETE TO authenticated
USING (
  owner_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'property_owner'
  )
);

-- Anyone may submit an inquiry about an approved property.
-- No sender identity or elevated credentials are required.
GRANT INSERT (property_id, inquirer_email, message)
ON public.inquiries TO anon, authenticated;

CREATE POLICY exam_inquiries_insert
ON public.inquiries FOR INSERT TO anon, authenticated
WITH CHECK (
  sender_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.properties AS p
    WHERE p.id = inquiries.property_id
      AND p.status = 'approved'
  )
);

-- Signed-in users only see inquiries for properties they own.
-- Being an inquiry's sender does not grant read access.
GRANT SELECT ON public.inquiries TO authenticated;

CREATE POLICY exam_inquiries_owner_read
ON public.inquiries FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties AS p
    WHERE p.id = inquiries.property_id
      AND p.owner_id = (SELECT auth.uid())
  )
);

-- Trusted server administration uses Supabase's elevated role.
-- Never expose its secret key to the browser.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.profiles,
  public.properties,
  public.sponsors,
  public.property_sponsors,
  public.inquiries
TO service_role;

COMMIT;