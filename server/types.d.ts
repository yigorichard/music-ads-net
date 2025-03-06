import 'express-session';
import { User } from '@db/schema';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

declare module 'express' {
  interface Request {
    user?: User;
  }
}