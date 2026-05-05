import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);

const rules = [
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

const severityPenalty = {
  critical: 25,
  error: 15,
  warning: 8,
  info: 3,
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(payload));
}

function analyzeCode(code) {
  const issues = [];

  code.split('\n').forEach((line, index) => {
    rules.forEach(rule => {
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
  const fixedCode = code
    .split('\n')
    .filter(line => !/\bconsole\.(log|debug|info)\s*\(/.test(line))
    .join('\n');

  return {
    issues,
    score: Math.max(0, 100 - penalty),
    fixedCode,
    summary: issues.length
      ? `Found ${issues.length} issue${issues.length === 1 ? '' : 's'} across security, reliability, and quality checks.`
      : 'No issues found by the backend analyzer.',
  };
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 128) {
        reject(new Error('Payload too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, { ok: true, service: 'reviewly-backend' });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/reviews/analyze') {
    try {
      const body = await readRequestBody(request);
      const payload = JSON.parse(body || '{}');

      if (typeof payload.code !== 'string' || payload.code.trim().length === 0) {
        sendJson(response, 400, { error: 'code is required' });
        return;
      }

      sendJson(response, 200, analyzeCode(payload.code));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Reviewly backend listening on http://127.0.0.1:${PORT}`);
});
