
import { CreateRoleInput, UpdateRoleInput } from "./role.types.js";
import { roleRepository } from "./role.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import { UpdateRoleBody } from "./role.validation.js";

const normalizeCode = (code: string) => {
  return code.trim().toUpperCase();
};

export const roleService = {
  async create(data: CreateRoleInput) {
    const normalizedCode = normalizeCode(data.code);
    const existingRole = await roleRepository.findByCode(normalizedCode);
    if (existingRole) {
      throw new ApiError(
        409,
        `Role with code '${normalizedCode}' already exists.`,
      );
    }

    try {
      return await roleRepository.create({
        ...data,
        code: normalizedCode,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ApiError(
          409,
          `Role with code "${normalizedCode}" already exists`,
        );
      }

      throw error;
    }
  },

  async getAll(options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
  }) {
    return roleRepository.findAll(options);
  },

  async getById(roleId: string) {
    const role = await roleRepository.findById(roleId);

    if (!role) {
      throw new ApiError(404, `Role with id "${roleId}" not found`);
    }
    return role;
  },

  async update(roleId: string, data: UpdateRoleInput) {
    const existingRole = await roleRepository.findById(roleId);
    if (!existingRole) {
      throw new ApiError(404, `Role with id ${roleId} not found`);
    }
    if (existingRole.isSystemRole) {
      throw new ApiError(403, "System roles cannot be modified");
    }

    const updatedRole = await roleRepository.updateById(roleId, data);
    if (!updatedRole) {
      throw new ApiError(404, "Role not found");
    }

    return updatedRole;
  },

  async updateStatus(roleId: string, isActive: boolean) {
    const existingRole = await roleRepository.findById(roleId);

    if (!existingRole) {
      throw new ApiError(404, `Role with id ${roleId} not found`);
    }

    if (existingRole.isSystemRole) {
      throw new ApiError(
        403,
        "System roles cannot be activated or deactivated",
      );
    }

    const updatedRole = await roleRepository.updateStatus(roleId, isActive);

    if (!updatedRole) {
      throw new ApiError(404, "Role not found");
    }

    return updatedRole;
  },

  async remove(roleId: string) {
    const role = await roleRepository.findById(roleId);

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    if (role.isSystemRole) {
      throw new ApiError(403, "System roles cannot be deleted");
    }

    // TODO (Phase 6 - Permissions): before deleting, check whether any
    // Permission document still references this roleId and, if so, deny
    // the delete (or cascade-delete those permissions), the same way the
    // Action module needs to check Permission.actionIds before removal.
    // TODO (Phase 5 - Users): also worth checking whether any User still
    // has this role assigned, so deletion doesn't silently orphan users.
    await roleRepository.deleteById(roleId);

    return null;
  },
};
