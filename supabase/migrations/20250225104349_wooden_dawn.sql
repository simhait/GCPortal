/*
  # Add quiz attempts tracking

  1. New Tables
    - `quiz_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `module_id` (text)
      - `score` (integer)
      - `passed` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `quiz_attempts` table
    - Add policies for user access
*/

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  module_id text NOT NULL,
  score integer NOT NULL,
  passed boolean NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own quiz attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_quiz_attempts_user_module 
ON quiz_attempts(user_id, module_id);

CREATE INDEX idx_quiz_attempts_created_at 
ON quiz_attempts(created_at);