-- Function to generate underperforming metrics for Primero High
CREATE OR REPLACE FUNCTION generate_underperforming_metrics(
  check_date date,
  base_value numeric,
  performance_factor numeric DEFAULT 0.7, -- 70% of expected performance
  variation_percent numeric DEFAULT 0.1
) RETURNS numeric AS $$
DECLARE
  day_of_week integer;
  is_holiday boolean;
  daily_factor numeric;
BEGIN
  day_of_week := EXTRACT(DOW FROM check_date);
  is_holiday := check_date IN (
    '2024-12-25', '2024-12-24', '2024-12-23',  -- Winter Break
    '2024-11-28', '2024-11-29',                 -- Thanksgiving
    '2024-01-01',                               -- New Year
    '2024-01-15',                               -- MLK Day
    '2024-02-19',                               -- Presidents Day
    '2024-03-11', '2024-03-12', '2024-03-13',  -- Spring Break
    '2024-03-14', '2024-03-15',
    '2024-05-27'                                -- Memorial Day
  );

  -- Base factor from day of week
  daily_factor := CASE
    WHEN day_of_week = 1 THEN 0.9    -- Monday (lower than normal)
    WHEN day_of_week = 5 THEN 0.7    -- Friday (much lower)
    WHEN day_of_week = 0 OR day_of_week = 6 THEN 0.0  -- Weekend
    ELSE 0.8                         -- Other days (below normal)
  END;

  -- Adjust for holidays
  IF is_holiday THEN
    daily_factor := 0.0;
  END IF;

  -- Add random variation and apply performance factor
  daily_factor := daily_factor * performance_factor * (1 + (random() * variation_percent) - (variation_percent / 2));

  RETURN GREATEST(base_value * daily_factor, 0);
END;
$$ LANGUAGE plpgsql;

-- Generate daily metrics for Primero High from August 1, 2024
WITH RECURSIVE dates AS (
  SELECT generate_series(
    '2024-08-01'::date,
    CURRENT_DATE,
    '1 day'::interval
  )::date AS date
),
school_metrics AS (
  SELECT 
    s.id as school_id,
    s.name,
    1200 as enrollment,           -- Base enrollment
    0.55 as free_reduced_rate,    -- Base free/reduced rate
    0.20 as breakfast_rate,       -- Lower breakfast participation
    0.50 as lunch_rate           -- Lower lunch participation
  FROM schools s
  WHERE s.name = 'Primero High'
  AND s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
INSERT INTO school_daily_metrics (
  school_id,
  date,
  total_enrollment,
  free_reduced_count,
  breakfast_count,
  lunch_count,
  reimbursement_amount,
  alc_revenue,
  meal_equivalents,
  labor_hours,
  district_id
)
SELECT
  sm.school_id,
  d.date,
  sm.enrollment,
  (sm.enrollment * sm.free_reduced_rate)::int,
  generate_underperforming_metrics(d.date, sm.enrollment * sm.breakfast_rate, 0.7)::int,
  generate_underperforming_metrics(d.date, sm.enrollment * sm.lunch_rate, 0.75)::int,
  generate_underperforming_metrics(d.date, 4000, 0.8),  -- Lower reimbursement
  generate_underperforming_metrics(d.date, 800, 0.7),   -- Lower a la carte revenue
  generate_underperforming_metrics(d.date, 800, 0.7)::int,  -- Lower meal equivalents
  60, -- Keep labor hours constant
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
FROM dates d
CROSS JOIN school_metrics sm
WHERE EXTRACT(DOW FROM d.date) NOT IN (0, 6)  -- Exclude weekends
ON CONFLICT (school_id, date) DO UPDATE
SET
  total_enrollment = EXCLUDED.total_enrollment,
  free_reduced_count = EXCLUDED.free_reduced_count,
  breakfast_count = EXCLUDED.breakfast_count,
  lunch_count = EXCLUDED.lunch_count,
  reimbursement_amount = EXCLUDED.reimbursement_amount,
  alc_revenue = EXCLUDED.alc_revenue,
  meal_equivalents = EXCLUDED.meal_equivalents,
  labor_hours = EXCLUDED.labor_hours;

-- Add higher food waste by reducing meal equivalents further
UPDATE school_daily_metrics
SET meal_equivalents = (meal_equivalents * 0.7)::int  -- Additional 30% reduction to simulate waste
WHERE school_id IN (
  SELECT id FROM schools 
  WHERE name = 'Primero High'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
AND date >= '2024-08-01';