import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const createUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please provide a valid email address"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters"),

    roles: z.array(objectIdSchema).optional().default([]),

    isActive: z.boolean().optional().default(true),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const getUsersSchema = z.object({
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

    // Filter users that hold a specific role, e.g. GET /users?roleId=<id>
    roleId: objectIdSchema.optional(),
  }),
});

export const getUserByIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}),
});

// Password intentionally excluded - changing a password is a distinct,
// more sensitive flow (should require current-password confirmation and
// probably re-issue tokens), not a field on the generic update endpoint.
export const updateUserSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .optional(),

      email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Please provide a valid email address")
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

export const updateUserStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

// Replaces the user's entire role set. An empty array is valid - it means
// "remove all roles from this user".
export const assignRolesSchema = z.object({
  body: z.object({
    roleIds: z.array(objectIdSchema),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const deleteUserSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export type CreateUserBody = z.infer<typeof createUserSchema>["body"];

export type GetUsersQuery = z.infer<typeof getUsersSchema>["query"];

export type UserIdParams = z.infer<typeof getUserByIdSchema>["params"];

export type UpdateUserBody = z.infer<typeof updateUserSchema>["body"];

export type UpdateUserStatusBody = z.infer<
  typeof updateUserStatusSchema
>["body"];

export type AssignRolesBody = z.infer<typeof assignRolesSchema>["body"];
