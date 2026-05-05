import { ReviewIssue } from '../types';

type IssueDraft = Omit<ReviewIssue, 'id' | 'review_id' | 'created_at'>;

export interface AnalysisResult {
  issues: IssueDraft[];
  score: number;
  summary: string;
  fixedCode: string;
}

interface PatternRule {
  pattern: RegExp;
  severity: ReviewIssue['severity'];
  category: string;
  title: string;
  description: string;
  suggestion: string;
}

const RULES: PatternRule[] = [
  {
    pattern: /\beval\s*\(/,
    severity: 'critical',
    category: 'security',
    title: 'Avoid eval execution',
    description: 'Dynamic code execution can allow remote code execution when input is not fully trusted.',
    suggestion: 'Replace eval with a parser, lookup table, or explicitly allowed command map.',
  },
  {
    pattern: /(password|secret|token|api[_-]?key)\s*[:=]\s*['"][^'"]+['"]/i,
    severity: 'critical',
    category: 'security',
    title: 'Hardcoded secret detected',
    description: 'Secrets committed in source code can leak credentials and give attackers direct access.',
    suggestion: 'Move secrets into environment variables or a managed secrets store.',
  },
  {
    pattern: /\bconsole\.(log|debug|info)\s*\(/,
    severity: 'warning',
    category: 'quality',
    title: 'Console statement in production path',
    description: 'Console statements can leak data and make production logs noisy.',
    suggestion: 'Use a structured logger with safe fields and environment-specific log levels.',
  },
  {
    pattern: /catch\s*\([^)]*\)\s*{\s*(console\.(log|error)\([^)]*\);?)?\s*}/,
    severity: 'error',
    category: 'reliability',
    title: 'Swallowed exception',
    description: 'Catching an error without recovery, rethrowing, or returning a safe fallback hides failures.',
    suggestion: 'Handle the error explicitly, return a safe fallback, or rethrow after logging.',
  },
  {
    pattern: /innerHTML\s*=/,
    severity: 'critical',
    category: 'security',
    title: 'Unsafe HTML injection',
    description: 'Assigning HTML directly can introduce cross-site scripting when content includes user input.',
    suggestion: 'Render text content or sanitize HTML with a trusted sanitizer before insertion.',
  },
];

const severityPenalty: Record<ReviewIssue['severity'], number> = {
  critical: 25,
  error: 15,
  warning: 8,
  info: 3,
};

export function analyzeCode(code: string): AnalysisResult {
  const lines = code.split('\n');
  const issues: IssueDraft[] = [];

  lines.forEach((line, index) => {
    RULES.forEach(rule => {
      if (!rule.pattern.test(line)) return;

      issues.push({
        line_start: index + 1,
        line_end: index + 1,
        severity: rule.severity,
        category: rule.category,
        title: rule.title,
        description: rule.description,
        suggestion: rule.suggestion,
        fixed_code: '',
      });
    });
  });

  const penalty = issues.reduce((total, issue) => total + severityPenalty[issue.severity], 0);
  const score = Math.max(0, 100 - penalty);
  const fixedCode = code
    .split('\n')
    .filter(line => !/\bconsole\.(log|debug|info)\s*\(/.test(line))
    .join('\n');

  return {
    issues,
    score,
    fixedCode,
    summary: issues.length
      ? `Found ${issues.length} issue${issues.length === 1 ? '' : 's'} across security, reliability, and quality checks.`
      : 'No issues found by the built-in rules.',
  };
}
