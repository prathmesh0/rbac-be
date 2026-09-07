import type { GetActionsQuery } from "../modules/actions/action.validation.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
      };
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
