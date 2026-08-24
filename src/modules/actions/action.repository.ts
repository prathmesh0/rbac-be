import { Action } from "./action.model.js";
import type { CreateActionInput, UpdateActionInput } from "./action.types.js";

export interface FindActionsOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
}

interface ActionFilter {
  $or?: Array<{
    name?: { $regex: string; $options: string };
    code?: { $regex: string; $options: string };
  }>;
  isActive?: boolean;
}

export const actionRepository = {
  async create(data: CreateActionInput) {
    return Action.create(data);
  },

  async findById(actionId: string) {
    return Action.findById(actionId);
  },

  async findByCode(code: string) {
    return Action.findOne({ code });
  },

  async findAll(options: FindActionsOptions) {
    const { page, limit, search, isActive } = options;

    const filter: ActionFilter = {};

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
      Action.find(filter)
        .sort({ code: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),

      Action.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async updateById(actionId: string, data: UpdateActionInput) {
    return Action.findByIdAndUpdate(actionId, data, {
      new: true,
      runValidators: true,
    }).exec();
  },

  async updateStatus(actionId: string, isActive: boolean) {
    return Action.findByIdAndUpdate(
      actionId,
      { isActive },
      { new: true, runValidators: true },
    ).exec();
  },

  async deleteById(actionId: string) {
    return Action.findByIdAndDelete(actionId).exec();
  },
};
