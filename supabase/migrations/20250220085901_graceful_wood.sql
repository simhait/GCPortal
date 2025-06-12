-- Update Food Waste KPI to use dollar amounts
UPDATE kpis
SET 
  unit = '$',
  benchmark = 250.00,  -- $250 baseline waste value
  goal = 100.00,       -- $100 target waste value
  description = 'Financial value of food waste based on portion costs'
WHERE name = 'Food Waste'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';

-- Recalculate existing KPI values to dollar amounts
-- Assuming $2.50 per portion cost
UPDATE kpi_values kv
SET value = value * 2.50
FROM kpis k
WHERE k.id = kv.kpi_id
AND k.name = 'Food Waste'
AND k.district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';