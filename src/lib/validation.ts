import { MAX_CODE_SIZE, LANGUAGES } from './constants';

export function validateCodeInput(code: string, language: string): { valid: boolean; error?: string } {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: 'Code cannot be empty' };
  }

  if (code.length > MAX_CODE_SIZE) {
    return { valid: false, error: `Code too large. Maximum ${MAX_CODE_SIZE / 1024}KB allowed.` };
  }

  if (!LANGUAGES.includes(language as (typeof LANGUAGES)[number])) {
    return { valid: false, error: `Language "${language}" not supported.` };
  }

  return { valid: true };
}

export function detectLanguage(code: string): string {
  if (code.includes('import React') || code.includes('from "react"')) return 'typescript';
  if (code.includes('async') || code.includes('await')) return 'javascript';
  if (code.includes('def ')) return 'python';
  if (code.includes('func ') && code.includes('package ')) return 'go';
  if (code.includes('func ') || code.includes('var ')) return 'swift';
  if (code.includes('package ')) return 'java';
  return 'javascript';
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): {
  valid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  checks: { label: string; pass: boolean }[];
} {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Contains uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Contains number', pass: /[0-9]/.test(password) },
  ];

  const passed = checks.filter(c => c.pass).length;
  const strength = passed === 3 ? 'strong' : passed === 2 ? 'medium' : 'weak';

  return {
    valid: passed >= 2,
    strength,
    checks,
  };
}
