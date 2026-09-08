import { Module } from "./module.model.js";
import type { CreateModuleInput, UpdateModuleInput } from "./module.types.js";

export interface FindModuleOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  parentModuleId?: string;
}

interface ModuleFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    code?: { $regex: string; $options: string };
  }>;
  isActive?: boolean;
  parentModuleId?: string | null;
}

export const moduleRepository = {
  async create(data: CreateModuleInput) {
    return Module.create(data);
  },

  async findById(moduleId: string) {
    return Module.findById(moduleId);
  },

  async findByCode(code: string) {
    return Module.findOne({ code });
  },

  async findAll(options: FindModuleOptions) {
    const { page, limit, search, isActive, parentModuleId } = options;

    const filter: ModuleFilter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (parentModuleId !== undefined) {
      filter.parentModuleId = parentModuleId;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Module.find(filter)
        .sort({ order: 1, code: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      Module.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async findAllActive() {
    return Module.find({ isActive: true })
      .sort({ order: 1, code: 1 })
      .lean()
      .exec();
  },

  async countChildren(parentModuleId: string) {
    return Module.countDocuments({ parentModuleId }).exec();
  },

  async updateById(moduleId: string, data: UpdateModuleInput) {
    return Module.findByIdAndUpdate(moduleId, data, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async updateStatus(moduleId: string, isActive: boolean) {
    return Module.findByIdAndUpdate(
      moduleId,
      {
        isActive,
      },
      {
        new: true,
        runValidators: true,
      },
    ).exec();
  },

  async deleteById(moduleId: string) {
    return Module.findByIdAndDelete(moduleId).exec();
  },
};
