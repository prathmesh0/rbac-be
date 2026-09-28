import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const createPermissionSchema = z.object({
  body: z.object({
    roleId: objectIdSchema,
    moduleId: objectIdSchema,
    actionIds: z
      .array(objectIdSchema)
      .min(1, "At least one action is required"),
  }),

  params: z.object({}),
  query: z.object({}),
});

export const getPermissionsSchema = z.object({
  body: z.object({}),

  params: z.object({}),

  query: z.object({
    page: z.coerce.number().int().positive().default(1),

    limit: z.coerce.number().int().positive().max(100).default(20),

    roleId: objectIdSchema.optional(),
    moduleId: objectIdSchema.optional(),
  }),
});

export const getPermissionsByRoleSchema = z.object({
  body: z.object({}),
  params: z.object({
    roleId: objectIdSchema,
  }),
  query: z.object({}),
});

// roleId/moduleId are intentionally not updatable - that pair is what
// uniquely identifies this permission document. To move a grant to a
// different role/module, delete this one and create a new one.
export const updatePermissionSchema = z.object({
  body: z.object({
    actionIds: z
      .array(objectIdSchema)
      .min(1, "At least one action is required"),
  }),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export const deletePermissionSchema = z.object({
  body: z.object({}),

  params: z.object({
    id: objectIdSchema,
  }),

  query: z.object({}),
});

export type CreatePermissionBody = z.infer<
  typeof createPermissionSchema
>["body"];

export type GetPermissionsQuery = z.infer<typeof getPermissionsSchema>["query"];

export type GetPermissionsByRoleParams = z.infer<
  typeof getPermissionsByRoleSchema
>["params"];

export type UpdatePermissionBody = z.infer<
  typeof updatePermissionSchema
>["body"];

export type PermissionIdParams = z.infer<
  typeof updatePermissionSchema
>["params"];
