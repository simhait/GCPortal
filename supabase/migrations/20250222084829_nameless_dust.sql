-- Add columns for supper program if they don't exist
ALTER TABLE school_daily_metrics 
ADD COLUMN IF NOT EXISTS supper_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_meal_supper integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reduced_meal_supper integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_meal_supper integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS supper_participation_rate decimal(5,2) GENERATED ALWAYS AS (
  CASE WHEN total_enrollment > 0 
  THEN (supper_count::decimal / total_enrollment::decimal * 100) 
  ELSE 0 END
) STORED;

-- Add Supper KPI
INSERT INTO kpis (
  name,
  description,
  unit,
  benchmark,
  goal,
  district_id,
  is_hidden,
  display_order
)
SELECT
  'Supper',
  'Percentage of enrolled students participating in the Child and Adult Care Food Program (CACFP) Supper Program',
  '%',
  25,  -- Benchmark: 25% participation
  35,  -- Goal: 35% participation
  district_id,
  false,
  8  -- After Snack in the display order
FROM kpis
WHERE name = 'Lunch'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Update February 2025 data with supper metrics
WITH dates AS (
  SELECT generate_series(
    '2025-02-01'::date,
    '2025-02-28'::date,
    '1 day'::interval
  )::date AS date
)
UPDATE school_daily_metrics sdm
SET
  supper_count = CASE 
    WHEN EXTRACT(DOW FROM sdm.date) IN (0, 6) OR 
         sdm.date IN ('2025-02-17', '2025-02-18') THEN 0  -- Skip weekends and holidays
    ELSE
      ROUND(
        sdm.total_enrollment * 
        CASE  -- Base participation rates
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Cybersoft High'
          ) THEN 0.20
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Cybersoft Middle'
          ) THEN 0.25
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Cybersoft Elementary'
          ) THEN 0.30
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Primero High'
          ) THEN 0.15
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Primero Elementary'
          ) THEN 0.20
          ELSE 0.20
        END *
        CASE  -- Performance factors
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Cybersoft High'
          ) THEN 1.1
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Cybersoft Middle'
          ) THEN 1.0
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Cybersoft Elementary'
          ) THEN 1.05
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Primero High'
          ) THEN 0.75
          WHEN EXISTS (
            SELECT 1 FROM schools s 
            WHERE s.id = sdm.school_id 
            AND s.name = 'Primero Elementary'
          ) THEN 0.9
          ELSE 1.0
        END *
        CASE  -- Daily factors
          WHEN EXTRACT(DOW FROM sdm.date) = 1 THEN 1.1  -- Higher on Mondays
          WHEN EXTRACT(DOW FROM sdm.date) = 5 THEN 0.9  -- Lower on Fridays
          ELSE 1.0
        END *
        (1 + (random() * 0.1 - 0.05))  -- Add random variation
      )::integer
    END,
  free_meal_supper = CASE 
    WHEN EXTRACT(DOW FROM sdm.date) IN (0, 6) OR 
         sdm.date IN ('2025-02-17', '2025-02-18') THEN 0
    ELSE
      ROUND(sdm.free_count * 0.8 * supper_count / NULLIF(sdm.total_enrollment, 0))::integer
    END,
  reduced_meal_supper = CASE 
    WHEN EXTRACT(DOW FROM sdm.date) IN (0, 6) OR 
         sdm.date IN ('2025-02-17', '2025-02-18') THEN 0
    ELSE
      ROUND(sdm.reduced_count * 0.7 * supper_count / NULLIF(sdm.total_enrollment, 0))::integer
    END
WHERE sdm.date >= '2025-02-01' 
AND sdm.date <= '2025-02-28'
AND sdm.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Calculate paid_meal_supper as the remainder
UPDATE school_daily_metrics
SET paid_meal_supper = GREATEST(0, supper_count - free_meal_supper - reduced_meal_supper)
WHERE date >= '2025-02-01' 
AND date <= '2025-02-28'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Generate KPI values for Supper participation
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  k.id as kpi_id,
  sdm.supper_participation_rate as value,
  sdm.date,
  sdm.school_id,
  k.district_id
FROM school_daily_metrics sdm
CROSS JOIN kpis k
WHERE k.name = 'Supper'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND sdm.date >= '2025-02-01'
AND sdm.date <= '2025-02-28'
AND sdm.supper_participation_rate > 0
ON CONFLICT (kpi_id, school_id, date) 
DO UPDATE SET value = EXCLUDED.value;