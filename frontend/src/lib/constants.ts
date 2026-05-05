export const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'critical' },
  error: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'error' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'warning' },
  info: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'info' },
} as const;

export const SEVERITY_ICONS = {
  critical: 'critical',
  error: 'error',
  warning: 'warning',
  info: 'info',
} as const;

export const ERROR_MESSAGES = {
  AUTH_FAILED: 'Authentication failed. Please check your credentials.',
  GITHUB_AUTH: 'GitHub authentication failed. Please reconnect your account.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  REVIEW_FAILED: 'Failed to create review. Please try again.',
  UPLOAD_SIZE: 'File too large. Maximum 100KB allowed.',
  INVALID_LANGUAGE: 'Language not recognized. Supported: JavaScript, TypeScript, Python, Go, Rust, Java.',
  RATE_LIMIT: 'You\'ve reached your monthly review limit. Upgrade to continue.',
  GENERIC: 'Something went wrong. Please try again.',
} as const;

export const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'swift',
  'kotlin',
  'sql',
  'html',
  'css',
] as const;

export const REVIEW_STATUS = ['pending', 'analyzing', 'complete', 'error'] as const;

export const RULE_PRESETS = [
  { name: 'No console.log', pattern: 'console\\.log', severity: 'warning', category: 'quality' },
  { name: 'No eval()', pattern: 'eval\\s*\\(', severity: 'critical', category: 'security' },
  { name: 'No hardcoded passwords', pattern: '["\']password["\']\\s*[:=]', severity: 'critical', category: 'security' },
  { name: 'No TODO comments', pattern: '//\\s*TODO', severity: 'info', category: 'quality' },
  { name: 'No var keyword', pattern: '\\bvar\\s+', severity: 'warning', category: 'quality' },
  { name: 'No crypto without TLS', pattern: 'crypto\\.', severity: 'error', category: 'security' },
] as const;

export const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
export const MAX_CODE_SIZE = 100 * 1024; // 100KB
export const FREE_TIER_REVIEWS = 50; // per month
