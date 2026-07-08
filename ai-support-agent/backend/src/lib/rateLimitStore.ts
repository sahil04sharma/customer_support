import type { Store, Options, IncrementResponse, ClientRateLimitInfo } from 'express-rate-limit';
import { redis } from './redis';

/**
 * Redis-backed rate limit store for multi-instance deployments (Upstash REST).
 */
export class UpstashRateLimitStore implements Store {
  prefix: string;
  windowMs!: number;

  constructor(prefix = 'rl:') {
    this.prefix = prefix;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private key(k: string): string {
    return `${this.prefix}${k}`;
  }

  async increment(key: string): Promise<IncrementResponse> {
    const redisKey = this.key(key);
    const totalHits = await redis.incr(redisKey);
    if (totalHits === 1) {
      await redis.expire(redisKey, Math.ceil(this.windowMs / 1000));
    }
    const resetTime = new Date(Date.now() + this.windowMs);
    return { totalHits, resetTime };
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.key(key);
    const current = await redis.get<number>(redisKey);
    if (typeof current === 'number' && current > 0) {
      // Upstash REST has no DECR in our wrapper — best-effort skip
    }
  }

  async resetKey(key: string): Promise<void> {
    await redis.del(this.key(key));
  }

  async get(key: string): Promise<ClientRateLimitInfo | undefined> {
    const totalHits = await redis.get<number>(this.key(key));
    if (totalHits == null) return undefined;
    return {
      totalHits,
      resetTime: new Date(Date.now() + this.windowMs),
    };
  }
}
