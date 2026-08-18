import type { AuthenticatedUser } from "../modules/auth/auth.types.ts";

declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser;
    }
  }
}
export {};
