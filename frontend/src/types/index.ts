export interface Profile {
  id: string;
  username: string | null;
  full_name: string;
  avatar_url: string;
  bio: string;
  subscription_tier: string;
  total_reviews: number;
  github_username: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar_url: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  team_id: string | null;
  title: string;
  language: string;
  original_code: string;
  fixed_code: string;
  summary: string;
  score: number;
  issue_count: number;
  status: 'pending' | 'analyzing' | 'complete' | 'error';
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewIssue {
  id: string;
  review_id: string;
  line_start: number;
  line_end: number;
  severity: 'critical' | 'error' | 'warning' | 'info';
  category: string;
  title: string;
  description: string;
  suggestion: string;
  fixed_code: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  action_url: string;
  created_at: string;
}

export interface ConnectedRepo {
  id: string;
  user_id: string;
  team_id: string | null;
  repo_full_name: string;
  repo_url: string;
  webhook_id: string;
  webhook_secret: string;
  auto_review: boolean;
  created_at: string;
}

export interface CustomRule {
  id: string;
  team_id: string | null;
  user_id: string;
  name: string;
  description: string;
  pattern: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  category: string;
  enabled: boolean;
  is_preset: boolean;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  model: string;
  strictness: number;
  auto_fix: boolean;
  show_line_numbers: boolean;
  theme: string;
  notifications_enabled: boolean;
}
