import { apiPath } from '../config/env';

const AUTH_TIMEOUT_MS = 45000;

export class AuthTimeoutError extends Error {
  constructor() {
    super(
      'The server is taking longer than usual (often the first request after idle). Please try again in a few seconds.'
    );
    this.name = 'AuthTimeoutError';
  }
}

export async function authRequest(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);
  try {
    return await fetch(apiPath(path), { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AuthTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
