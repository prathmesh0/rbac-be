import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

interface ValidatedRequestData {
  body: unknown;
  params: unknown;
  query: unknown;
}

export const validate =
  (schema: ZodType<ValidatedRequestData>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));

      return next(new ApiError(400, "Validation failed", errors));
    }

    req.body = result.data.body;
    req.params = result.data.params as Request["params"];

    // Do not assign result.data.query to req.query in Express 5.

    next();
  };
