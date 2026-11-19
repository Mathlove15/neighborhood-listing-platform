-- Standalone audit fixture, separate from the homepage data.
-- Tier mapping: Silver = 1, Gold = 2, Platinum = 3.
-- Ranking: priority descending, then ID ascending.
-- Distance and impressions do not affect ranking.

BEGIN;

CREATE TEMP TABLE sponsor_audit_fixture (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  priority INTEGER NOT NULL,
  distance_miles NUMERIC NOT NULL,
  impressions INTEGER NOT NULL,
  status TEXT NOT NULL,
  active BOOLEAN NOT NULL,
  placement TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  service_zips TEXT[] NOT NULL,
  internal_notes TEXT
) ON COMMIT DROP;

-- All sample campaigns have active dates and cover ZIP 90032.
INSERT INTO sponsor_audit_fixture VALUES
(
  'A', 'Sponsor A', 'Silver', 1, 0.4, 120,
  'APPROVED', TRUE, 'homepage',
  CURRENT_DATE - 1, CURRENT_DATE + 1,
  ARRAY['90032'], 'Internal fixture note'
),
(
  'B', 'Sponsor B', 'Gold', 2, 1.2, 45,
  'APPROVED', TRUE, 'homepage',
  CURRENT_DATE - 1, CURRENT_DATE + 1,
  ARRAY['90032'], 'Internal fixture note'
),
(
  'C', 'Sponsor C', 'Gold', 2, 0.8, 90,
  'APPROVED', TRUE, 'homepage',
  CURRENT_DATE - 1, CURRENT_DATE + 1,
  ARRAY['90032'], 'Internal fixture note'
),
(
  'D', 'Sponsor D', 'Platinum', 3, 0.2, 10,
  'PENDING', TRUE, 'homepage',
  CURRENT_DATE - 1, CURRENT_DATE + 1,
  ARRAY['90032'], 'Internal fixture note'
);

-- Return public fields only.
SELECT id, name
FROM sponsor_audit_fixture
WHERE status = 'APPROVED'                  -- Approval
  AND active = TRUE                      -- Active campaign
  AND CURRENT_DATE BETWEEN start_date
                       AND end_date      -- Valid dates
  AND '90032' = ANY(service_zips)         -- ZIP coverage
  AND placement = 'homepage'             -- Placement
ORDER BY priority DESC, id COLLATE "C" ASC
LIMIT 1;

ROLLBACK;
