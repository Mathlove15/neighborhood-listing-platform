BEGIN;

-- Start with no public or signed-in access.
REVOKE ALL ON TABLE
    public.profiles,
    public.properties,
    public.sponsors,
    public.property_sponsors,
    public.inquiries
FROM PUBLIC, anon, authenticated;

GRANT USAGE ON SCHEMA public
TO anon, authenticated, service_role;

-- Visitors and signed-in users may read public records.
GRANT SELECT ON TABLE
    public.properties,
    public.sponsors,
    public.property_sponsors
TO anon, authenticated;

-- Private records require a signed-in user.
GRANT SELECT ON TABLE public.profiles, public.inquiries
TO authenticated;

-- Allow only the fields users need to supply or change.
GRANT INSERT (id, full_name)
ON public.profiles TO authenticated;

GRANT UPDATE (full_name)
ON public.profiles TO authenticated;

GRANT INSERT (owner_id, title, price)
ON public.properties TO authenticated;

GRANT UPDATE (title, price)
ON public.properties TO authenticated;

GRANT INSERT (property_id, sender_id, message)
ON public.inquiries TO authenticated;

-- Server administrators use this role after authorization.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    public.profiles,
    public.properties,
    public.sponsors,
    public.property_sponsors,
    public.inquiries
TO service_role;

-- Profiles: users can read and maintain their own profile.
CREATE POLICY profiles_read_self
ON public.profiles FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY profiles_insert_self
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY profiles_update_self
ON public.profiles FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

-- Properties: public approved listings and private owner drafts.
CREATE POLICY properties_read_approved
ON public.properties FOR SELECT TO anon, authenticated
USING (is_approved = TRUE);

CREATE POLICY properties_read_own_drafts
ON public.properties FOR SELECT TO authenticated
USING (
    owner_id = (SELECT auth.uid())
    AND is_approved = FALSE
);

CREATE POLICY properties_insert_own_drafts
ON public.properties FOR INSERT TO authenticated
WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND is_approved = FALSE
);

CREATE POLICY properties_update_own_drafts
ON public.properties FOR UPDATE TO authenticated
USING (
    owner_id = (SELECT auth.uid())
    AND is_approved = FALSE
)
WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND is_approved = FALSE
);

-- Sponsors: only active sponsors are public.
CREATE POLICY sponsors_read_active
ON public.sponsors FOR SELECT TO anon, authenticated
USING (is_active = TRUE);

-- Links are public only for approved listings and active sponsors.
CREATE POLICY property_sponsors_read_public
ON public.property_sponsors FOR SELECT TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.properties AS p
        WHERE p.id = property_sponsors.property_id
          AND p.is_approved = TRUE
    )
    AND EXISTS (
        SELECT 1 FROM public.sponsors AS s
        WHERE s.id = property_sponsors.sponsor_id
          AND s.is_active = TRUE
    )
);

-- Inquiries: senders can read their own messages.
CREATE POLICY inquiries_read_self
ON public.inquiries FOR SELECT TO authenticated
USING (sender_id = (SELECT auth.uid()));

CREATE POLICY inquiries_insert_self
ON public.inquiries FOR INSERT TO authenticated
WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND EXISTS (
        SELECT 1 FROM public.properties AS p
        WHERE p.id = inquiries.property_id
          AND p.is_approved = TRUE
    )
);

COMMIT;
