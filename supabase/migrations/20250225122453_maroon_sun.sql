/*
  # Add Learning Courses Management

  1. New Tables
    - learning_courses: Stores course information
    - learning_course_sections: Stores course sections/modules
    - learning_course_resources: Stores course resources/materials

  2. Security
    - Enable RLS on all tables
    - Only directors can manage courses
    - Staff can view published courses
*/

-- Create learning_courses table
CREATE TABLE learning_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  duration text,
  instructor_name text NOT NULL,
  instructor_title text,
  instructor_avatar_url text,
  objectives text[],
  prerequisites text[],
  passing_score integer NOT NULL DEFAULT 80,
  is_published boolean DEFAULT false,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning_course_sections table
CREATE TABLE learning_course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text[],
  video_url text,
  order_index integer NOT NULL,
  duration text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning_course_resources table
CREATE TABLE learning_course_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('pdf', 'doc', 'video', 'link')),
  url text NOT NULL,
  size text,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning_course_questions table
CREATE TABLE learning_course_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL,
  correct_answer integer NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_course_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_course_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for learning_courses
CREATE POLICY "Directors can manage courses"
  ON learning_courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_courses.district_id
      AND users.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_courses.district_id
      AND users.role = 'director'
    )
  );

CREATE POLICY "Staff can view published courses"
  ON learning_courses FOR SELECT
  TO authenticated
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = learning_courses.district_id
    )
  );

-- Create policies for learning_course_sections
CREATE POLICY "Directors can manage course sections"
  ON learning_course_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_sections.course_id
      AND u.id = auth.uid()
      AND u.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_sections.course_id
      AND u.id = auth.uid()
      AND u.role = 'director'
    )
  );

CREATE POLICY "Staff can view published course sections"
  ON learning_course_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_sections.course_id
      AND c.is_published = true
      AND u.id = auth.uid()
    )
  );

-- Create policies for learning_course_resources
CREATE POLICY "Directors can manage course resources"
  ON learning_course_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_resources.course_id
      AND u.id = auth.uid()
      AND u.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_resources.course_id
      AND u.id = auth.uid()
      AND u.role = 'director'
    )
  );

CREATE POLICY "Staff can view published course resources"
  ON learning_course_resources FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_resources.course_id
      AND c.is_published = true
      AND u.id = auth.uid()
    )
  );

-- Create policies for learning_course_questions
CREATE POLICY "Directors can manage course questions"
  ON learning_course_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_questions.course_id
      AND u.id = auth.uid()
      AND u.role = 'director'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_questions.course_id
      AND u.id = auth.uid()
      AND u.role = 'director'
    )
  );

CREATE POLICY "Staff can view published course questions"
  ON learning_course_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM learning_courses c
      JOIN users u ON u.district_id = c.district_id
      WHERE c.id = learning_course_questions.course_id
      AND c.is_published = true
      AND u.id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_learning_courses_district 
ON learning_courses(district_id);

CREATE INDEX idx_learning_course_sections_course 
ON learning_course_sections(course_id);

CREATE INDEX idx_learning_course_resources_course 
ON learning_course_resources(course_id);

CREATE INDEX idx_learning_course_questions_course 
ON learning_course_questions(course_id);

-- Add updated_at triggers
CREATE TRIGGER update_learning_courses_updated_at
  BEFORE UPDATE ON learning_courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_course_sections_updated_at
  BEFORE UPDATE ON learning_course_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_course_resources_updated_at
  BEFORE UPDATE ON learning_course_resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_course_questions_updated_at
  BEFORE UPDATE ON learning_course_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();