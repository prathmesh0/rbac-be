import { ApiError } from "../../utils/ApiError.js";
import { actionRepository } from "./action.repository.js";
import { CreateActionInput, UpdateActionInput } from "./action.types.js";

const normalizeCode = (code: string) => {
  return code.trim().toUpperCase();
};

export const actionService = {
  async create(data: CreateActionInput) {
    const normalizedCode = normalizeCode(data.code);
    const existingAction = await actionRepository.findByCode(data.code);
    if (existingAction) {
      throw new ApiError(
        409,
        `Action with code ${normalizedCode} already exists`,
      );
    }

    try {
      return await actionRepository.create({
        ...data,
        code: normalizedCode,
      });
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new ApiError(
          409,
          `Action with code "${normalizedCode}" already exists`,
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
    return actionRepository.findAll(options);
  },

  async getById(actionId: string) {
    const action = await actionRepository.findById(actionId);

    if (!action) {
      throw new ApiError(404, `Action with id ${actionId} not found`);
    }
    return action;
  },

  async update(actionId: string, data: UpdateActionInput) {
    const existingAction = await actionRepository.findById(actionId);

    if (!existingAction) {
      throw new ApiError(404, `Action with id ${actionId} not found`);
    }
    const updateData: UpdateActionInput = {
      ...data,
    };

    if (updateData.code) {
      updateData.code = normalizeCode(updateData.code);

      const duplicate = await actionRepository.findByCode(updateData.code);

      if (duplicate && duplicate._id.toString() !== actionId) {
        throw new ApiError(
          409,
          `Action with code "${updateData.code}" already exists`,
        );
      }

      try {
        const updatedAction = await actionRepository.updateById(
          actionId,
          updateData,
        );

        if (!updatedAction) {
          throw new ApiError(404, "Action not found");
        }
        return updatedAction;
      } catch (error: any) {
        if (error?.code === 11000) {
          throw new ApiError(409, "Another action already uses this code");
        }

        throw error;
      }
    }
  },

  async updateStatus(actionId: string, isActive: boolean) {
    const action = await actionRepository.updateStatus(actionId, isActive);
    if (!action) {
      throw new ApiError(404, "Action not found");
    }

    return action;
  },

  async remove(actionId: string) {
    const action = await actionRepository.findById(actionId);
    if (!action) {
      throw new ApiError(404, "Action not found");
    }
    //TODO: Permission check is still here like check where any permission is already using this action then deny to Delete
    await actionRepository.deleteById(actionId);
    return null;
  },
};
