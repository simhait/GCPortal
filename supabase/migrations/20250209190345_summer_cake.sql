-- Add trigger to refresh KPI values when benchmarks change
CREATE OR REPLACE FUNCTION refresh_kpi_values()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the updated_at timestamp on related KPI values
  -- This will trigger a refresh in the application
  UPDATE kpi_values
  SET updated_at = now()
  WHERE kpi_id = NEW.kpi_id
  AND school_id = NEW.school_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for school_benchmarks
CREATE TRIGGER refresh_kpi_values_on_benchmark_change
  AFTER INSERT OR UPDATE ON school_benchmarks
  FOR EACH ROW
  EXECUTE FUNCTION refresh_kpi_values();

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_school_benchmarks_school_kpi 
  ON school_benchmarks(school_id, kpi_id);

CREATE INDEX IF NOT EXISTS idx_kpi_values_kpi_school_date 
  ON kpi_values(kpi_id, school_id, date);