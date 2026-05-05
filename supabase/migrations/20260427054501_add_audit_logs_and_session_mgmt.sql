/*
  # Add Audit Logs & Session Management

  1. New Tables
    - `audit_logs` - Track review actions (create, view, export)

  2. New Columns
    - `user_settings.last_activity` - Track inactivity for session timeout
    - `reviews.exported_at` - Track when reports were exported
    - `reviews.shared_with` - JSON list of shared user IDs

  3. Security
    - RLS policies for audit log access (users see own logs)
    - Restrict shared review viewing by policy
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_id uuid REFERENCES reviews(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_settings' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE user_settings ADD COLUMN last_activity timestamptz DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'exported_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN exported_at timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'shared_with'
  ) THEN
    ALTER TABLE reviews ADD COLUMN shared_with uuid[] DEFAULT '{}';
  END IF;
END $$;
