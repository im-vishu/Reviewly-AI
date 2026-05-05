import { analyzeCode, AnalysisResult } from './analyzer';

const REVIEW_API_URL = import.meta.env.VITE_REVIEW_API_URL as string | undefined;

export async function analyzeReview(code: string, language: string): Promise<AnalysisResult> {
  if (!REVIEW_API_URL) {
    return analyzeCode(code);
  }

  try {
    const response = await fetch(`${REVIEW_API_URL.replace(/\/$/, '')}/reviews/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });

    if (!response.ok) {
      throw new Error(`Review API returned ${response.status}`);
    }

    return await response.json() as AnalysisResult;
  } catch (error) {
    console.warn('Review API unavailable, using browser analyzer fallback.', error);
    return analyzeCode(code);
  }
}
