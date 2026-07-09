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

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function optionalList(name: string): string[] {
  const raw = process.env[name];
  if (!raw?.trim()) return [];
  return raw.split(',').map((s) => normalizeOrigin(s.trim())).filter(Boolean);
}

const nodeEnv = optional('NODE_ENV', 'development');
const clientUrl = normalizeOrigin(optional('CLIENT_URL', 'http://localhost:5173'));
const extraOrigins = optionalList('ALLOWED_ORIGINS');

export const env = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  trustProxy: optional('TRUST_PROXY', 'false') === 'true',

  port: Number(optional('PORT', '5000')),
  clientUrl,
  allowedOrigins: [clientUrl, ...extraOrigins.filter((o) => o !== clientUrl)],

  databaseUrl: read('DATABASE_URL'),

  groqApiKey: read('GROQ_API_KEY'),
  geminiApiKey: read('GEMINI_API_KEY'),

  upstashRedisUrl: read('UPSTASH_REDIS_REST_URL'),
  upstashRedisToken: read('UPSTASH_REDIS_REST_TOKEN'),

  jwtSecret: optional('JWT_SECRET', 'dev-access-secret-change-me'),
  jwtRefreshSecret: optional('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),

  /** AES key material for encrypting tenant API keys at rest */
  encryptionKey: optional('ENCRYPTION_KEY', 'dev-encryption-key-change-in-production-32chars'),

  cloudinary: {
    cloudName: read('CLOUDINARY_CLOUD_NAME'),
    apiKey: read('CLOUDINARY_API_KEY'),
    apiSecret: read('CLOUDINARY_API_SECRET'),
  },

  resendApiKey: optional('RESEND_API_KEY', ''),
  emailFrom: optional('EMAIL_FROM', 'SupportDesk <onboarding@resend.dev>'),
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

  if (env.isProduction) {
    if (env.jwtSecret.includes('dev-') || env.jwtSecret.length < 32) {
      console.warn('[env] JWT_SECRET is weak for production. Use a long random string.');
    }
    if (env.jwtRefreshSecret.includes('dev-') || env.jwtRefreshSecret.length < 32) {
      console.warn('[env] JWT_REFRESH_SECRET is weak for production. Use a long random string.');
    }
    if (env.encryptionKey.includes('dev-') || env.encryptionKey.length < 32) {
      console.warn('[env] ENCRYPTION_KEY is weak for production. Use a long random string.');
    }
    if (missing.length > 0) {
      console.warn('[env] Production is missing required environment variables.');
    }
    console.log(`[env] Allowed dashboard origins (CORS): ${env.allowedOrigins.join(', ')}`);
  }
}
