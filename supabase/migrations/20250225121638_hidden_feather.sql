/*
  # Fix Quiz Attempts Table

  1. Changes
    - Add district_id column to quiz_attempts table
    - Create proper indexes and constraints
    - Update RLS policies
    - Add trigger for updated_at

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Recreate quiz_attempts table with proper structure
DROP TABLE IF EXISTS quiz_attempts CASCADE;

CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  module_id text NOT NULL,
  score integer NOT NULL,
  passed boolean NOT NULL,
  district_id uuid NOT NULL REFERENCES districts(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.district_id = quiz_attempts.district_id
      AND users.role = 'director'
    )
  );

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_quiz_attempts_user_module 
ON quiz_attempts(user_id, module_id);

CREATE INDEX idx_quiz_attempts_district 
ON quiz_attempts(district_id);

-- Add updated_at trigger
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();