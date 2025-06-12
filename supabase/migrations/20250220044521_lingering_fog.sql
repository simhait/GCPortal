-- Add Snack Participation KPI
INSERT INTO kpis (
  name,
  description,
  unit,
  benchmark,
  goal,
  district_id,
  is_hidden
)
SELECT
  'Snack Participation',
  'Percentage of enrolled students participating in the Afterschool Snack Program (ASP)',
  '%',
  25,  -- Benchmark: 25% participation
  35,  -- Goal: 35% participation
  district_id,
  false
FROM kpis
WHERE name = 'Lunch Participation'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Add columns for snack program metrics if they don't exist
ALTER TABLE school_daily_metrics 
ADD COLUMN IF NOT EXISTS snack_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_meal_snack integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reduced_meal_snack integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_meal_snack integer DEFAULT 0;

-- Add computed column for snack participation rate
ALTER TABLE school_daily_metrics ADD COLUMN IF NOT EXISTS snack_participation_rate 
  decimal(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_enrollment > 0 
    THEN (snack_count::decimal / total_enrollment::decimal * 100) 
    ELSE 0 END
  ) STORED;

-- Generate sample snack program data
WITH school_metrics AS (
  SELECT 
    s.id as school_id,
    s.name,
    CASE 
      WHEN s.name = 'Cybersoft High' THEN 0.25    -- 25% participation
      WHEN s.name = 'Cybersoft Middle' THEN 0.30  -- 30% participation
      WHEN s.name = 'Cybersoft Elementary' THEN 0.35  -- 35% participation
      WHEN s.name = 'Primero High' THEN 0.20     -- 20% participation
      WHEN s.name = 'Primero Elementary' THEN 0.25 -- 25% participation
    END as snack_rate
  FROM schools s
  WHERE s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
UPDATE school_daily_metrics sdm
SET
  snack_count = ROUND(total_enrollment * sm.snack_rate * 
    CASE 
      WHEN EXTRACT(DOW FROM date) = 1 THEN 1.1  -- Higher on Mondays
      WHEN EXTRACT(DOW FROM date) = 5 THEN 0.9  -- Lower on Fridays
      ELSE 1.0
    END * (1 + (random() * 0.1 - 0.05))  -- Add some random variation
  ),
  free_meal_snack = ROUND(free_count * sm.snack_rate * 1.2),  -- Higher participation from free eligible
  reduced_meal_snack = ROUND(reduced_count * sm.snack_rate * 1.1),  -- Higher participation from reduced eligible
  paid_meal_snack = ROUND(
    (total_enrollment - free_count - reduced_count) * sm.snack_rate * 0.8  -- Lower participation from paid
  )
FROM school_metrics sm
WHERE sdm.school_id = sm.school_id
AND sdm.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND EXTRACT(DOW FROM date) NOT IN (0, 6);  -- Skip weekends

-- Generate KPI values from snack participation rates
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  k.id as kpi_id,
  sdm.snack_participation_rate as value,
  sdm.date,
  sdm.school_id,
  k.district_id
FROM school_daily_metrics sdm
CROSS JOIN kpis k
WHERE k.name = 'Snack Participation'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND sdm.snack_participation_rate > 0
ON CONFLICT (kpi_id, school_id, date) 
DO UPDATE SET value = EXCLUDED.value;