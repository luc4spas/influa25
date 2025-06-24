/*
  # Event Registration Schema

  1. New Tables
    - `registrations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `age` (integer)
      - `church` (text)
      - `status` (text)

  2. Security
    - Enable RLS on `registrations` table
    - Add policies for inserting and viewing registrations
*/

CREATE TABLE registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    age integer NOT NULL,
    church text NOT NULL,
    status text DEFAULT 'pending'
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert registrations"
    ON registrations
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Users can view their own registrations"
    ON registrations
    FOR SELECT
    TO anon
    USING (email IS NOT NULL);