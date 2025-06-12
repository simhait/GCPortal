-- First, identify the primary Revenue KPI to keep
WITH primary_revenue_kpi AS (
  SELECT id 
  FROM kpis 
  WHERE name = 'Revenue'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  ORDER BY created_at
  LIMIT 1
),
-- Update KPI values to point to the primary KPI before deleting duplicates
kpi_values_updated AS (
  UPDATE kpi_values
  SET kpi_id = (SELECT id FROM primary_revenue_kpi)
  WHERE kpi_id IN (
    SELECT k.id
    FROM kpis k
    WHERE k.name = 'Revenue'
    AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
    AND k.id NOT IN (SELECT id FROM primary_revenue_kpi)
  )
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  RETURNING kpi_id
)
-- Now we can safely delete the duplicate KPIs
DELETE FROM kpis
WHERE id IN (
  SELECT k.id
  FROM kpis k
  WHERE k.name = 'Revenue'
  AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  AND k.id NOT IN (SELECT id FROM primary_revenue_kpi)
);

-- Ensure Revenue KPI has correct settings
UPDATE kpis
SET 
  description = 'Total revenue from reimbursable meals and non-reimbursable sales',
  unit = '$',
  benchmark = 7500,  -- Base benchmark for high schools
  goal = 8500,      -- Base goal for high schools
  is_hidden = false
WHERE id IN (
  SELECT id 
  FROM kpis 
  WHERE name = 'Revenue'
  AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
  LIMIT 1
);