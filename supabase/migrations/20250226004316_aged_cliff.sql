-- Create sys_platforms table
CREATE TABLE sys_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sys_modules table
CREATE TABLE sys_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid NOT NULL REFERENCES sys_platforms(id),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sys_roles table
CREATE TABLE sys_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sys_module_role_mapping table
CREATE TABLE sys_module_role_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES sys_modules(id),
  role_id uuid NOT NULL REFERENCES sys_roles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(module_id, role_id)
);

-- Create sys_course_module_mapping table
CREATE TABLE sys_course_module_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES learning_courses(id),
  module_id uuid NOT NULL REFERENCES sys_modules(id),
  is_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(course_id, module_id)
);

-- Create sys_user_role_mapping table
CREATE TABLE sys_user_role_mapping (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  role_id uuid NOT NULL REFERENCES sys_roles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE sys_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_module_role_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_course_module_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE sys_user_role_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view platforms"
  ON sys_platforms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view modules"
  ON sys_modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view roles"
  ON sys_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view module role mappings"
  ON sys_module_role_mapping FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view course module mappings"
  ON sys_course_module_mapping FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view user role mappings"
  ON sys_user_role_mapping FOR SELECT
  TO authenticated
  USING (true);

-- Create function to get recommended courses for a user
CREATE OR REPLACE FUNCTION get_recommended_courses(p_user_id uuid)
RETURNS TABLE (
  course_id uuid,
  is_required boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    cm.course_id,
    bool_or(cm.is_required) as is_required
  FROM sys_user_role_mapping urm
  JOIN sys_module_role_mapping mrm ON mrm.role_id = urm.role_id
  JOIN sys_course_module_mapping cm ON cm.module_id = mrm.module_id
  WHERE urm.user_id = p_user_id
  GROUP BY cm.course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;