-- Add Enrollment KPI if it doesn't exist
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
  'Enrollment',
  'Total number of enrolled students across all programs',
  '#',
  CASE 
    WHEN s.name LIKE '%High%' THEN 1200
    WHEN s.name LIKE '%Middle%' THEN 800
    ELSE 600
  END as benchmark,
  CASE 
    WHEN s.name LIKE '%High%' THEN 1500
    WHEN s.name LIKE '%Middle%' THEN 1000
    ELSE 750
  END as goal,
  s.district_id,
  false
FROM schools s
WHERE s.name = 'Cybersoft High'
AND s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND NOT EXISTS (
  SELECT 1 FROM kpis 
  WHERE name = 'Enrollment' 
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
);

-- Generate KPI values from total_enrollment in school_daily_metrics
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  k.id as kpi_id,
  sdm.total_enrollment as value,
  sdm.date,
  sdm.school_id,
  k.district_id
FROM school_daily_metrics sdm
CROSS JOIN kpis k
WHERE k.name = 'Enrollment'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
AND sdm.total_enrollment IS NOT NULL
ON CONFLICT (kpi_id, school_id, date) 
DO UPDATE SET value = EXCLUDED.value;