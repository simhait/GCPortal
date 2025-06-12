/*
  # Add Supper Program Support
  
  1. New Columns
    - Add supper_count to school_daily_metrics
    - Add free_meal_supper, reduced_meal_supper, paid_meal_supper
    - Add supper_participation_rate computed column
  
  2. New KPI
    - Add Supper KPI for CACFP program tracking
*/

-- Add supper-related columns to school_daily_metrics
ALTER TABLE school_daily_metrics 
ADD COLUMN IF NOT EXISTS supper_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_meal_supper integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reduced_meal_supper integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_meal_supper integer DEFAULT 0;

-- Add computed column for supper participation rate
ALTER TABLE school_daily_metrics ADD COLUMN IF NOT EXISTS supper_participation_rate 
  decimal(5,2) GENERATED ALWAYS AS (
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
  'Percentage of enrolled students participating in the CACFP Supper Program',
  '%',
  25,  -- Benchmark: 25% participation
  35,  -- Goal: 35% participation
  district_id,
  false,
  8  -- Place after other meal KPIs
FROM kpis
WHERE name = 'Lunch'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Generate sample supper data
WITH school_metrics AS (
  SELECT 
    s.id as school_id,
    s.name,
    CASE 
      WHEN s.name = 'Cybersoft High' THEN 0.20    -- 20% participation
      WHEN s.name = 'Cybersoft Middle' THEN 0.25  -- 25% participation
      WHEN s.name = 'Cybersoft Elementary' THEN 0.30  -- 30% participation
      WHEN s.name = 'Primero High' THEN 0.15     -- 15% participation
      WHEN s.name = 'Primero Elementary' THEN 0.20 -- 20% participation
    END as supper_rate
  FROM schools s
  WHERE s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
UPDATE school_daily_metrics sdm
SET
  supper_count = ROUND(total_enrollment * sm.supper_rate * 
    CASE 
      WHEN EXTRACT(DOW FROM date) = 1 THEN 1.1  -- Higher on Mondays
      WHEN EXTRACT(DOW FROM date) = 5 THEN 0.9  -- Lower on Fridays
      ELSE 1.0
    END * (1 + (random() * 0.1 - 0.05))  -- Add some random variation
  ),
  free_meal_supper = ROUND(free_count * sm.supper_rate * 1.2),  -- Higher participation from free eligible
  reduced_meal_supper = ROUND(reduced_count * sm.supper_rate * 1.1),  -- Higher participation from reduced eligible
  paid_meal_supper = ROUND(
    (total_enrollment - free_count - reduced_count) * sm.supper_rate * 0.8  -- Lower participation from paid
  )
FROM school_metrics sm
WHERE sdm.school_id = sm.school_id
AND sdm.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND EXTRACT(DOW FROM date) NOT IN (0, 6);  -- Skip weekends