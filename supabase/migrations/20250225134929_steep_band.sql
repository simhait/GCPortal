-- Add missing columns to learning_courses table
ALTER TABLE learning_courses
ADD COLUMN IF NOT EXISTS sections jsonb[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resources jsonb[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS questions jsonb[] DEFAULT '{}';

-- Create indexes for JSON array columns
CREATE INDEX IF NOT EXISTS idx_learning_courses_sections
ON learning_courses USING gin(sections);

CREATE INDEX IF NOT EXISTS idx_learning_courses_resources
ON learning_courses USING gin(resources);

CREATE INDEX IF NOT EXISTS idx_learning_courses_questions
ON learning_courses USING gin(questions);

-- Update existing records to ensure they have the new columns
UPDATE learning_courses
SET 
  sections = COALESCE(sections, '{}'),
  resources = COALESCE(resources, '{}'),
  questions = COALESCE(questions, '{}');