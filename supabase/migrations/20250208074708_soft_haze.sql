/*
  # Add test user profile

  1. Changes
    - Create user profile for test user
    - Link profile to auth user
*/

-- Ensure user profile exists and is linked
INSERT INTO users (id, email, role, district_id)
VALUES (
  '81554677-ec62-4e85-ae70-e7b649fcca26',
  'director@demo.com',
  'director',
  'd7c01812-80ae-4662-8f5e-4ab37a46f3e2'
)
ON CONFLICT (id) DO UPDATE
SET email = 'director@demo.com',
    role = 'director',
    district_id = 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2';