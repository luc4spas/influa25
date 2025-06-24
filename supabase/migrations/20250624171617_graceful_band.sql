/*
  # Fix admin policies for registrations table

  1. Security
    - Update RLS policies to allow admins to read all registrations
    - Ensure admin users can access all data when authenticated
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own registrations" ON registrations;

-- Create new policies for registrations
CREATE POLICY "Anyone can insert registrations"
  ON registrations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admins can view all registrations"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (
        SELECT email FROM auth.users 
        WHERE auth.users.id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can update all registrations"
  ON registrations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = (
        SELECT email FROM auth.users 
        WHERE auth.users.id = auth.uid()
      )
    )
  );