const SENSITIVE_KEY = /password|secret|token|api[_-]?key|authorization|cookie|credential/i;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) {
    return '[REDACTED]';
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return redactObject(value as Record<string, unknown>);
  }
  return value;
}

function redactObject(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

/** Log errors without leaking secrets from nested request bodies or env. */
export function logError(context: string, err: unknown): void {
  if (err instanceof Error) {
    console.error(`[${context}]`, err.message);
    return;
  }
  console.error(`[${context}]`, String(err));
}
