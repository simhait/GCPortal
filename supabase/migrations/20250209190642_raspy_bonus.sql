-- Add updated_at column to kpi_values table
ALTER TABLE kpi_values ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add trigger to update updated_at column
CREATE TRIGGER update_kpi_values_updated_at
  BEFORE UPDATE ON kpi_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add index on updated_at column
CREATE INDEX IF NOT EXISTS idx_kpi_values_updated_at 
  ON kpi_values(updated_at);