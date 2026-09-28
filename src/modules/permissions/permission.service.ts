import { ApiError } from "../../utils/ApiError.js";
import { permissionRepository } from "./permission.repository.js";
import { roleRepository } from "../roles/role.repository.js";
import { moduleRepository } from "../modules/module.repository.js";
import { actionRepository } from "../actions/action.repository.js";
import type {
  CreatePermissionInput,
  ModulePermissionSummary,
  UserPermissionSummary,
} from "./permission.type.js";

const validateActionIds = async (actionIds: string[]) => {
  const results = await Promise.all(
    actionIds.map((actionId) => actionRepository.findById(actionId)),
  );

  const missingIndex = results.findIndex((action) => !action);
  if (missingIndex !== -1) {
    throw new ApiError(
      404,
      `Action with id ${actionIds[missingIndex]} not found`,
    );
  }
};
export const permissionService = {
  async create(data: CreatePermissionInput) {
    const role = await roleRepository.findById(data.roleId);
    if (!role) {
      throw new ApiError(404, `Role with id ${data.roleId} not found`);
    }

    const moduleDoc = await moduleRepository.findById(data.moduleId);

    if (!moduleDoc) {
      throw new ApiError(404, "Module not found");
    }

    await validateActionIds(data.actionIds);

    const existing = await permissionRepository.findByRoleAndModule(
      data.roleId,
      data.moduleId,
    );
    if (existing) {
      throw new ApiError(
        409,
        `A permission for this role and module already exists (id: ${existing._id}). Use PATCH to update its actions instead.`,
      );
    }

    // Dedupe in case the client sends the same actionId twice.
    const uniqueActionIds = Array.from(new Set(data.actionIds));

    try {
      const created = await permissionRepository.create({
        ...data,
        actionIds: uniqueActionIds,
      });

      return await permissionRepository.findByIdPopulated(
        created._id.toString(),
      );
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ApiError(
          409,
          "A permission for this role and module already exists",
        );
      }
      throw error;
    }
  },

  async getAll(options: {
    page: number;
    limit: number;
    roleId?: string;
    moduleId?: string;
  }) {
    return permissionRepository.findAll(options);
  },

  async getByRoleId(roleId: string) {
    const role = await roleRepository.findById(roleId);
    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    return permissionRepository.findByRoleId(roleId);
  },

  async update(permissionId: string, actionIds: string[]) {
    const existing = await permissionRepository.findById(permissionId);
    if (!existing) {
      throw new ApiError(404, "Permission not found");
    }

    await validateActionIds(actionIds);

    const uniqueActionIds = Array.from(new Set(actionIds));

    const updated = await permissionRepository.updateActionIds(
      permissionId,
      uniqueActionIds,
    );

    if (!updated) {
      throw new ApiError(404, "Permission not found");
    }

    return updated;
  },

  async remove(permissionId: string) {
    const existing = await permissionRepository.findById(permissionId);
    if (!existing) {
      throw new ApiError(404, "Permission not found");
    }

    await permissionRepository.deleteById(permissionId);
    return null;
  },

  async getUserPermissionSummary(
    roles: Array<{ _id: unknown; name: string; code: string }>,
  ): Promise<UserPermissionSummary> {
    if (roles.length === 0) {
      return { roles: [], permissions: [] };
    }

    const roleIds = roles.map((role) => String(role._id));
    const permissionDocs = await permissionRepository.findByRoleIds(roleIds);

    const moduleMap = new Map<string, ModulePermissionSummary>();

    for (const doc of permissionDocs as any[]) {
      const moduleDoc = doc.moduleId;

      // moduleId may be null if the referenced module was deleted, or the
      // module may have since been deactivated - skip either case rather
      // than surfacing a broken/ghost entry to the frontend.
      if (!moduleDoc || moduleDoc.isActive === false) continue;

      const moduleId = String(moduleDoc._id);

      const actionCodes = ((doc.actionIds ?? []) as any[])
        .filter((action) => action && action.isActive !== false)
        .map((action) => action.code as string);

      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          module: {
            id: moduleId,
            name: moduleDoc.name,
            code: moduleDoc.code,
            path: moduleDoc.path,
            icon: moduleDoc.icon,
          },
          actions: [],
        });
      }

      const entry = moduleMap.get(moduleId)!;
      for (const code of actionCodes) {
        if (!entry.actions.includes(code)) {
          entry.actions.push(code);
        }
      }
    }

    return {
      roles: roles.map((role) => ({
        id: String(role._id),
        name: role.name,
        code: role.code,
      })),
      permissions: Array.from(moduleMap.values()),
    };
  },
};
