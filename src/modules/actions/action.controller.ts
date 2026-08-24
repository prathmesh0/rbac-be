import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { actionService } from "./action.service.js";
import {
  ActionIdParams,
  CreateActionBody,
  GetActionsQuery,
  UpdateActionStatusBody,
} from "./action.validation.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const createAction = asyncHandler(
  async (req: Request, res: Response) => {
    const action = await actionService.create(req.body as CreateActionBody);

    return res
      .status(201)
      .json(new ApiResponse(201, action, "Action created successfully"));
  },
);

export const getActions = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.validatedQuery ?? req.query) as GetActionsQuery;

  const result = await actionService.getAll({
    page: query.page,
    limit: query.limit,
    search: query.search,
    isActive: query.isActive,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Action fetch Successfully"));
});

export const getActionById = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ActionIdParams;
    const action = await actionService.getById(params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, action, "Action fetch Successfully"));
  },
);

export const updateActionStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ActionIdParams;
    const body = req.body as UpdateActionStatusBody;

    const action = await actionService.updateStatus(params.id, body.isActive);

    return res
      .status(200)
      .json(new ApiResponse(200, action, "Action status updated successfully"));
  },
);

export const deleteAction = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ActionIdParams;
    await actionService.remove(params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Action deleted successfully"));
  },
);
