-- Create user_kpi_preferences table
CREATE TABLE user_kpi_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  kpi_id uuid NOT NULL REFERENCES kpis(id),
  is_hidden boolean DEFAULT false,
  display_order integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, kpi_id)
);

-- Enable RLS
ALTER TABLE user_kpi_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own KPI preferences"
  ON user_kpi_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own KPI preferences"
  ON user_kpi_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KPI preferences"
  ON user_kpi_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_kpi_preferences_updated_at
  BEFORE UPDATE ON user_kpi_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();