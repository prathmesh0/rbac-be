import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

const roleCodeSchema = z
  .string()
  .trim()
  .transform((val) => val.toUpperCase())
  .pipe(
    z
      .string()
      .min(2, "Role code must be at least 2 characters")
      .max(50, "Role code cannot exceed 50 characters")
      .regex(
        /^[A-Z][A-Z0-9_]*$/,
        "Role code may contain only uppercase letters, numbers, and underscores",
      ),
  );

export const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Role name must be at least 2 characters")
      .max(100, "Role name cannot exceed 100 characters"),

    code: roleCodeSchema,

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),

    // Only trusted callers (e.g. a bootstrap script) should set this true.
    // Defaults to false so regular API consumers create ordinary roles.
    isSystemRole: z.boolean().optional().default(false),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const getRolesSchema = z.object({
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

export const getRoleByIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

// Deliberately excludes "code" - a role's code is immutable once created
// since Permission documents reference roles by their ObjectId, but
// letting the human-readable code drift post-creation invites confusion.
export const updateRoleSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Role name must be at least 2 characters")
        .max(100, "Role name cannot exceed 100 characters")
        .optional(),

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

export const updateRoleStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const deleteRoleSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export type CreateRoleBody = z.infer<typeof createRoleSchema>["body"];

export type GetRolesQuery = z.infer<typeof getRolesSchema>["query"];

export type RoleIdParams = z.infer<typeof getRoleByIdSchema>["params"];

export type UpdateRoleBody = z.infer<typeof updateRoleSchema>["body"];

export type UpdateRoleStatusBody = z.infer<
  typeof updateRoleStatusSchema
>["body"];
