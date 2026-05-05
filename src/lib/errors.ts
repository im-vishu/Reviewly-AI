import { ERROR_MESSAGES } from './constants';

export class AppError extends Error {
  constructor(
    public code: keyof typeof ERROR_MESSAGES,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(ERROR_MESSAGES[code]);
    this.name = 'AppError';
  }
}

export async function handleError(error: unknown): Promise<{ message: string; code: string; retry: boolean }> {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      retry: error.statusCode === 429 || error.statusCode === 503,
    };
  }

  if (error instanceof Error) {
    if (error.message.includes('401')) {
      return { message: ERROR_MESSAGES.AUTH_FAILED, code: 'AUTH_FAILED', retry: false };
    }
    if (error.message.includes('network')) {
      return { message: ERROR_MESSAGES.NETWORK_ERROR, code: 'NETWORK_ERROR', retry: true };
    }
  }

  return {
    message: ERROR_MESSAGES.GENERIC,
    code: 'GENERIC',
    retry: true,
  };
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}
