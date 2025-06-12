-- Add MEQ KPI
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
  'Meal Equivalents',
  'Total meal equivalents including reimbursable meals and a la carte sales',
  '#',
  CASE 
    WHEN s.name LIKE '%High%' THEN 1000
    WHEN s.name LIKE '%Middle%' THEN 800
    ELSE 600
  END as benchmark,
  CASE 
    WHEN s.name LIKE '%High%' THEN 1100
    WHEN s.name LIKE '%Middle%' THEN 880
    ELSE 660
  END as goal,
  s.district_id,
  false
FROM schools s
WHERE s.name = 'Cybersoft High'
AND s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
ON CONFLICT DO NOTHING;

-- Generate MEQ values based on meal counts and a la carte revenue
WITH daily_meq AS (
  SELECT
    school_id,
    date,
    -- Calculate MEQ:
    -- 1. Lunch meals count as 1 MEQ
    -- 2. Breakfast meals count as 0.67 MEQ
    -- 3. A la carte revenue divided by current free lunch reimbursement ($4.25)
    (
      lunch_count + 
      (breakfast_count * 0.67) +
      (alc_revenue / 4.25)
    )::integer as meq_value
  FROM school_daily_metrics
  WHERE district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  k.id as kpi_id,
  m.meq_value as value,
  m.date,
  m.school_id,
  k.district_id
FROM daily_meq m
CROSS JOIN kpis k
WHERE k.name = 'Meal Equivalents'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
ON CONFLICT (kpi_id, school_id, date) 
DO UPDATE SET value = EXCLUDED.value;