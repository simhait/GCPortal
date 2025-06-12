/*
  # Update user profile for new auth user

  1. Changes
    - Updates the existing user profile with the new auth ID
    - Handles the case where the email already exists
*/

UPDATE users 
SET id = '81554677-ec62-4e85-ae70-e7b649fcca26'
WHERE email = 'director@demo.com'
AND id = 'a56a2e14-0eb7-4734-87fa-78dc2d5e3ccd';