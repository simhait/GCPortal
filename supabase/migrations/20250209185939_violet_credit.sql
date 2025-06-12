-- Add relationship between Meals Served and Participation Rate KPIs
CREATE TABLE IF NOT EXISTS kpi_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_kpi_id uuid NOT NULL REFERENCES kpis(id),
  target_kpi_id uuid NOT NULL REFERENCES kpis(id),
  relationship_type text NOT NULL,
  formula text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(source_kpi_id, target_kpi_id)
);

-- Enable RLS
ALTER TABLE kpi_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view KPI relationships for their district"
  ON kpi_relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM kpis k
      JOIN users u ON u.district_id = k.district_id
      WHERE k.id = kpi_relationships.source_kpi_id
      AND u.id = auth.uid()
    )
  );

-- Add relationship between Participation Rate and Meals Served
INSERT INTO kpi_relationships (
  source_kpi_id,
  target_kpi_id,
  relationship_type,
  formula
)
SELECT 
  pr.id as source_kpi_id,
  ms.id as target_kpi_id,
  'drives_benchmark',
  'enrollment * (participation_rate / 100)'
FROM kpis pr
CROSS JOIN kpis ms
WHERE pr.name = 'Participation Rate'
AND ms.name = 'Meals Served'
AND pr.district_id = ms.district_id
ON CONFLICT DO NOTHING;

-- Update KPIs table to mark some as hidden
ALTER TABLE kpis ADD COLUMN IF NOT EXISTS is_hidden boolean DEFAULT false;

-- Hide KPIs that we don't want to show
UPDATE kpis
SET is_hidden = true
WHERE name IN (
  'Nutritional Compliance',
  'Revenue Per Meal',
  'Staff Training',
  'Local Food Usage',
  'Student Satisfaction'
);