-- Hide Production Accuracy KPI
UPDATE kpis
SET is_hidden = true
WHERE name = 'Production Accuracy'
AND district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';