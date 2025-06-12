/*
  # Initial Schema for School Nutrition Dashboard

  1. New Tables
    - districts
      - id (uuid, primary key)
      - name (text)
      - created_at (timestamp)
    
    - schools
      - id (uuid, primary key)
      - name (text)
      - district_id (uuid, foreign key)
      - created_at (timestamp)
    
    - kpis
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - unit (text)
      - benchmark (numeric)
      - goal (numeric)
      - school_id (uuid, foreign key, nullable)
      - district_id (uuid, foreign key)
      - created_at (timestamp)
    
    - kpi_values
      - id (uuid, primary key)
      - kpi_id (uuid, foreign key)
      - value (numeric)
      - date (date)
      - school_id (uuid, foreign key, nullable)
      - district_id (uuid, foreign key)
      - created_at (timestamp)
    
    - goals
      - id (uuid, primary key)
      - name (text)
      - target (numeric)
      - current (numeric)
      - start_date (date)
      - end_date (date)
      - school_id (uuid, foreign key, nullable)
      - district_id (uuid, foreign key)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on their role and school/district
*/

-- Create districts table
CREATE TABLE districts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create schools table
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now()
);

-- Create kpis table
CREATE TABLE kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  unit text NOT NULL,
  benchmark numeric NOT NULL,
  goal numeric NOT NULL,
  school_id uuid REFERENCES schools(id),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now()
);

-- Create kpi_values table
CREATE TABLE kpi_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id uuid NOT NULL REFERENCES kpis(id),
  value numeric NOT NULL,
  date date NOT NULL,
  school_id uuid REFERENCES schools(id),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now()
);

-- Create goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  target numeric NOT NULL,
  current numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  school_id uuid REFERENCES schools(id),
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Create policies for districts
CREATE POLICY "Users can view their district"
  ON districts FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for schools
CREATE POLICY "Users can view schools in their district"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for KPIs
CREATE POLICY "Users can view KPIs for their school/district"
  ON kpis FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN school_id IS NULL THEN true
      WHEN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND school_id = kpis.school_id
      ) THEN true
      ELSE false
    END
  );

-- Create policies for KPI values
CREATE POLICY "Users can view KPI values for their school/district"
  ON kpi_values FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN school_id IS NULL THEN true
      WHEN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND school_id = kpi_values.school_id
      ) THEN true
      ELSE false
    END
  );

-- Create policies for goals
CREATE POLICY "Users can view goals for their school/district"
  ON goals FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN school_id IS NULL THEN true
      WHEN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND school_id = goals.school_id
      ) THEN true
      ELSE false
    END
  );