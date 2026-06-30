import { TokenPayload } from '../services/auth.service';

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export {};
