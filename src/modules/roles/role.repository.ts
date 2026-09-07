import { Role } from "./role.model.js";
import { CreateRoleInput, UpdateRoleInput } from "./role.types.js";

export interface FindRolesOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

interface RoleFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    code?: { $regex: string; $options: string };
  }>;
  isActive?: boolean;
}

export const roleRepository = {
  async create(data: CreateRoleInput) {
    return Role.create(data);
  },

  async findById(roleId: string) {
    return Role.findById(roleId);
  },

  async findByCode(code: string) {
    return Role.findOne({ code });
  },

  async findAll(options: FindRolesOptions) {
    const { page, limit, search, isActive } = options;

    const filter: RoleFilter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Role.find(filter).sort({ code: 1 }).skip(skip).limit(limit).lean().exec(),

      Role.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateById(roleId: string, data: UpdateRoleInput) {
    return Role.findByIdAndUpdate(roleId, data, {
      new: true,
      runValidators: true,
    }).exec();
  },
  async updateStatus(roleId: string, isActive: boolean) {
    return Role.findByIdAndUpdate(
      roleId,
      { isActive },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  },

  async deleteById(roleId: string) {
    return Role.findByIdAndDelete(roleId).exec();
  },
};
