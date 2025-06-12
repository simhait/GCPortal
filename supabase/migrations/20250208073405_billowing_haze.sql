/*
  # Add initial district and user data

  1. New Data
    - Creates initial school district
    - Creates initial director user profile
  2. Changes
    - Inserts initial data into districts and users tables
*/

-- Insert initial district
INSERT INTO districts (id, name)
VALUES ('d7c01812-80ae-4662-8f5e-4ab37a46f3e2', 'Demo School District')
ON CONFLICT (id) DO NOTHING;

-- Insert initial director user
INSERT INTO users (id, email, role, district_id)
VALUES ('a56a2e14-0eb7-4734-87fa-78dc2d5e3ccd', 'director@demo.com', 'director', 'd7c01812-80ae-4662-8f5e-4ab37a46f3e2')
ON CONFLICT (id) DO NOTHING;