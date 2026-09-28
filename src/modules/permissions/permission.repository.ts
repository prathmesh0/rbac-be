import { Permission } from "./permission.model.js";
import type { CreatePermissionInput } from "./permission.type.js";

export interface FindPermissionOptions {
  page: number;
  limit: number;
  roleId?: string;
  moduleId?: string;
}

interface PermissionFilter {
  roleId?: string;
  moduleId?: string;
}

const ROLE_POPULATE = "name code";
const MODULE_POPULATE = "name code path icon order isActive";
const ACTION_POPULATE = "name code isActive";

export const permissionRepository = {
  async create(data: CreatePermissionInput) {
    return Permission.create(data);
  },
  async findById(permissionId: string) {
    return Permission.findById(permissionId);
  },

  async findByIdPopulated(permissionId: string) {
    return Permission.findById(permissionId)
      .populate("roleId", ROLE_POPULATE)
      .populate("moduleId", MODULE_POPULATE)
      .populate("actionIds", ACTION_POPULATE);
  },

  async findByRoleAndModule(roleId: string, moduleId: string) {
    return Permission.findOne({ roleId, moduleId });
  },

  async findAll(options: FindPermissionOptions) {
    const { page, limit, roleId, moduleId } = options;

    const filter: PermissionFilter = {};
    if (roleId) filter.roleId = roleId;
    if (moduleId) filter.moduleId = moduleId;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Permission.find(filter)
        .populate("roleId", ROLE_POPULATE)
        .populate("moduleId", MODULE_POPULATE)
        .populate("actionIds", ACTION_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      Permission.countDocuments(filter).exec(),
    ]);
    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Powers GET /permissions/role/:roleId - the "what does this role have
  // access to, module by module" view an admin UI uses to render/edit a
  // permission matrix for a single role.
  async findByRoleId(roleId: string) {
    return Permission.find({ roleId })
      .populate("moduleId", MODULE_POPULATE)
      .populate("actionIds", ACTION_POPULATE)
      .lean()
      .exec();
  },

  // Powers the login/me aggregation - one query across every role a user
  // holds, instead of N queries (one per role).
  async findByRoleIds(roleIds: string[]) {
    return Permission.find({ roleId: { $in: roleIds } })
      .populate("moduleId", MODULE_POPULATE)
      .populate("actionIds", ACTION_POPULATE)
      .lean()
      .exec();
  },

  async updateActionIds(permissionId: string, actionIds: string[]) {
    return Permission.findByIdAndUpdate(
      permissionId,
      { actionIds },
      { new: true, runValidators: true },
    )
      .populate("roleId", ROLE_POPULATE)
      .populate("moduleId", MODULE_POPULATE)
      .populate("actionIds", ACTION_POPULATE)
      .exec();
  },

  async deleteById(permissionId: string) {
    return Permission.findByIdAndDelete(permissionId).exec();
  },

  async existsForRole(roleId: string) {
    const count = await Permission.countDocuments({ roleId }).exec();
    return count > 0;
  },

  async existsForModule(moduleId: string) {
    const count = await Permission.countDocuments({ moduleId }).exec();
    return count > 0;
  },

  async existsForAction(actionId: string) {
    const count = await Permission.countDocuments({
      actionIds: actionId,
    }).exec();
    return count > 0;
  },
};
