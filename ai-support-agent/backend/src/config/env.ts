import dotenv from 'dotenv';

dotenv.config();

const missing: string[] = [];

function read(name: string, fallback = ''): string {
  const value = process.env[name];
  if (value === undefined || value === '') {
    missing.push(name);
    return fallback;
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  port: Number(optional('PORT', '5000')),
  clientUrl: optional('CLIENT_URL', 'http://localhost:5173'),

  databaseUrl: read('DATABASE_URL'),

  groqApiKey: read('GROQ_API_KEY'),
  geminiApiKey: read('GEMINI_API_KEY'),

  upstashRedisUrl: read('UPSTASH_REDIS_REST_URL'),
  upstashRedisToken: read('UPSTASH_REDIS_REST_TOKEN'),

  jwtSecret: optional('JWT_SECRET', 'dev-access-secret-change-me'),
  jwtRefreshSecret: optional('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),

  cloudinary: {
    cloudName: read('CLOUDINARY_CLOUD_NAME'),
    apiKey: read('CLOUDINARY_API_KEY'),
    apiSecret: read('CLOUDINARY_API_SECRET'),
  },
} as const;

/**
 * Logs a warning for any required env vars that are not set. The server still
 * boots so the health check and unaffected routes work during local setup, but
 * features depending on the missing service will fail when actually used.
 */
export function validateEnv(): void {
  if (missing.length > 0) {
    console.warn(
      `[env] Missing environment variables: ${missing.join(', ')}.\n` +
        `      Copy .env.example to .env and fill these in. Related features will not work until set.`
    );
  }
}
