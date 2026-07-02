import cors, { CorsOptions } from 'cors';
import { env } from '../config/env';

/** Embedded widget — may load from any customer website. */
export const permissiveCors = cors({
  origin: true,
  credentials: false,
});

function isAllowedDashboardOrigin(origin: string): boolean {
  return env.allowedOrigins.includes(origin);
}

/** Dashboard, auth, and authenticated API — restricted to known frontends. */
export const strictCorsOptions: CorsOptions = {
  origin(origin, callback) {
    // Same-origin / server-to-server / curl
    if (!origin) {
      callback(null, true);
      return;
    }
    if (isAllowedDashboardOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
};

export const strictCors = cors(strictCorsOptions);
