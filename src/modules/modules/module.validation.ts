import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

// Using transform().pipe() instead of a chained .toUpperCase() string method -
// this is the version-proof pattern (works identically across Zod v3/v4)
// that fixed the "code stored lowercase" bug we hit on the Role module.
const moduleCodeSchema = z
  .string()
  .trim()
  .transform((val) => val.toUpperCase())
  .pipe(
    z
      .string()
      .min(2, "Module code must be at least 2 characters")
      .max(50, "Module code cannot exceed 50 characters")
      .regex(
        /^[A-Z][A-Z0-9_]*$/,
        "Module code may contain only uppercase letters, numbers, and underscores",
      ),
  );

const pathSchema = z
  .string()
  .trim()
  .max(200, "Path cannot exceed 200 characters")
  .regex(
    /^\/[a-zA-Z0-9\-_/]*$/,
    "Path must start with '/' and contain only letters, numbers, hyphens, underscores, and slashes",
  )
  .optional();

const iconSchema = z
  .string()
  .trim()
  .max(100, "Icon cannot exceed 100 characters")
  .optional();

export const createModuleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Module name must be at least 2 characters")
      .max(100, "Module name cannot exceed 100 characters"),

    code: moduleCodeSchema,

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    path: pathSchema,
    icon: iconSchema,

    // null/omitted = top-level module; an ObjectId = nested under that parent
    parentModuleId: objectIdSchema.nullable().optional(),

    order: z.coerce
      .number()
      .int()
      .min(0, "Order cannot be negative")
      .optional()
      .default(0),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const getModulesSchema = z.object({
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

    // Lets the frontend fetch direct children of a given module,
    // e.g. GET /modules?parentModuleId=<dashboardId>
    parentModuleId: objectIdSchema.optional(),
  }),
});

export const getModuleTreeSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({}),
});

export const getModuleByIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

// Code intentionally excluded here, same rationale as Role: it's the stable
// identifier Permission documents will reference, so it shouldn't drift
// after creation.
export const updateModuleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Module name must be at least 2 characters")
        .max(100, "Module name cannot exceed 100 characters")
        .optional(),

      description: z
        .string()
        .trim()
        .max(500, "Description cannot exceed 500 characters")
        .optional(),

      path: pathSchema,
      icon: iconSchema,

      // Allow explicit null to move a module back to top-level.
      parentModuleId: objectIdSchema.nullable().optional(),

      order: z.coerce
        .number()
        .int()
        .min(0, "Order cannot be negative")
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

export const updateModuleStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const deleteModuleSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export type CreateModuleBody = z.infer<typeof createModuleSchema>["body"];

export type GetModulesQuery = z.infer<typeof getModulesSchema>["query"];

export type ModuleIdParams = z.infer<typeof getModuleByIdSchema>["params"];

export type UpdateModuleBody = z.infer<typeof updateModuleSchema>["body"];

export type UpdateModuleStatusBody = z.infer<
  typeof updateModuleStatusSchema
>["body"];
