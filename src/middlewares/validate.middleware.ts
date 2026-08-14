import { Request, Response, NextFunction } from "express";

import type { ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema: ZodType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation Error", errors));
    }
  };
};
