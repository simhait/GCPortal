-- Add Revenue KPI
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
  'Revenue',
  'Total revenue from reimbursable meals and non-reimbursable sales',
  '$',
  CASE 
    WHEN s.name LIKE '%High%' THEN 7500
    WHEN s.name LIKE '%Middle%' THEN 5000
    ELSE 3500
  END as benchmark,
  CASE 
    WHEN s.name LIKE '%High%' THEN 8500
    WHEN s.name LIKE '%Middle%' THEN 6000
    ELSE 4500
  END as goal,
  s.district_id,
  false
FROM schools s
WHERE s.name = 'Cybersoft High'
AND s.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
ON CONFLICT DO NOTHING;

-- Generate KPI values from reimbursement and a la carte revenue
INSERT INTO kpi_values (
  kpi_id,
  value,
  date,
  school_id,
  district_id
)
SELECT
  k.id as kpi_id,
  (sdm.reimbursement_amount + sdm.alc_revenue) as value,
  sdm.date,
  sdm.school_id,
  k.district_id
FROM school_daily_metrics sdm
CROSS JOIN kpis k
WHERE k.name = 'Revenue'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
ON CONFLICT (kpi_id, school_id, date) 
DO UPDATE SET value = EXCLUDED.value;

-- Hide Students KPI
UPDATE kpis
SET is_hidden = true
WHERE name = 'Students'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';