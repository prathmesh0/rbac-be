import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

const actionCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(2, "Action code must be at least 2 characters")
  .max(50, "Action code cannot exceed 50 characters")
  .regex(
    /^[A-Z][A-Z0-9_]*$/,
    "Action code may contain only uppercase letters, numbers, and underscores",
  );

export const createActionSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Action name must be at least 2 characters")
      .max(100, "Action name cannot exceed 100 characters"),

    code: actionCodeSchema,

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const getActionsSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({
    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().positive().max(100).default(20),

    search: z.string().trim().max(100).optional(),

    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional(),
  }),
});

export const getActionByIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

export const updateActionSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Action name must be at least 2 characters")
        .max(100, "Action name cannot exceed 100 characters")
        .optional(),

      code: actionCodeSchema.optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),
    })
    .strict()
    .refine(
      (data) => Object.keys(data).length > 0,
      "At least one field is required",
    ),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const updateActionStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const deleteActionSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export type CreateActionBody = z.infer<typeof createActionSchema>["body"];

export type GetActionsQuery = z.infer<typeof getActionsSchema>["query"];

export type ActionIdParams = z.infer<typeof getActionByIdSchema>["params"];

export type UpdateActionBody = z.infer<typeof updateActionSchema>["body"];

export type UpdateActionStatusBody = z.infer<
  typeof updateActionStatusSchema
>["body"];
