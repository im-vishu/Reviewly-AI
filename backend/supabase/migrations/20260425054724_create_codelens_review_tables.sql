/*
  # CodeLensAI Review & Integration Tables (Part 2 of 2)
  Creates reviews, issues, comparisons, repos, PR reviews, webhooks, rules, settings, notifications, api_keys.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  title text DEFAULT 'Untitled Review',
  language text DEFAULT 'javascript',
  original_code text NOT NULL DEFAULT '',
  fixed_code text DEFAULT '',
  summary text DEFAULT '',
  score int DEFAULT 0,
  issue_count int DEFAULT 0,
  status text DEFAULT 'pending',
  model_used text DEFAULT 'gpt-4',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = reviews.team_id
      AND team_members.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS review_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  line_start int DEFAULT 1,
  line_end int DEFAULT 1,
  severity text DEFAULT 'warning',
  category text DEFAULT 'quality',
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  suggestion text DEFAULT '',
  fixed_code text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view issues of accessible reviews"
  ON review_issues FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id AND (
        r.user_id = auth.uid() OR
        (r.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = r.team_id AND tm.user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can insert issues for own reviews"
  ON review_issues FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM reviews r
      WHERE r.id = review_id AND r.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS review_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  review_a_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  review_b_id uuid NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE review_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comparisons"
  ON review_comparisons FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own comparisons"
  ON review_comparisons FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS connected_repos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  repo_full_name text NOT NULL,
  repo_url text DEFAULT '',
  webhook_id text DEFAULT '',
  webhook_secret text DEFAULT '',
  auto_review boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE connected_repos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own repos"
  ON connected_repos FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own repos"
  ON connected_repos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own repos"
  ON connected_repos FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own repos"
  ON connected_repos FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS pr_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id uuid REFERENCES connected_repos(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pr_number int NOT NULL,
  pr_title text DEFAULT '',
  pr_url text DEFAULT '',
  review_id uuid REFERENCES reviews(id) ON DELETE SET NULL,
  status text DEFAULT 'pending',
  recommendation text DEFAULT 'review',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pr_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pr reviews"
  ON pr_reviews FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own pr reviews"
  ON pr_reviews FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_id uuid REFERENCES connected_repos(id) ON DELETE SET NULL,
  event_type text DEFAULT '',
  payload jsonb DEFAULT '{}',
  status text DEFAULT 'received',
  error_message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view logs for their repos"
  ON webhook_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connected_repos cr
      WHERE cr.id = repo_id AND cr.user_id = auth.uid()
    )
  );

CREATE TABLE IF NOT EXISTS custom_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  pattern text NOT NULL DEFAULT '',
  severity text DEFAULT 'warning',
  category text DEFAULT 'custom',
  enabled boolean DEFAULT true,
  is_preset boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view applicable rules"
  ON custom_rules FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    is_preset = true OR
    (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = custom_rules.team_id
      AND team_members.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert own rules"
  ON custom_rules FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own rules"
  ON custom_rules FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own rules"
  ON custom_rules FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model text DEFAULT 'gpt-4',
  strictness int DEFAULT 50,
  auto_fix boolean DEFAULT true,
  show_line_numbers boolean DEFAULT true,
  theme text DEFAULT 'dark',
  notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  message text DEFAULT '',
  type text DEFAULT 'info',
  read boolean DEFAULT false,
  action_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  key_prefix text NOT NULL DEFAULT '',
  key_hash text NOT NULL DEFAULT '',
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own api keys"
  ON api_keys FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own api keys"
  ON api_keys FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own api keys"
  ON api_keys FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_team_id ON reviews(team_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_issues_review_id ON review_issues(review_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
