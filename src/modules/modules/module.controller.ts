import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { moduleService } from "./module.service.js";
import {
  CreateModuleBody,
  GetModulesQuery,
  ModuleIdParams,
  UpdateModuleStatusBody,
} from "./module.validation.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { UpdateActionBody } from "../actions/action.validation.js";

export const createModule = asyncHandler(
  async (req: Request, res: Response) => {
    const moduleDoc = await moduleService.create(req.body as CreateModuleBody);
    return res
      .status(201)
      .json(new ApiResponse(201, moduleDoc, "Module created successfully"));
  },
);

export const getModules = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.validatedQuery ?? req.query) as GetModulesQuery;

  const result = await moduleService.getAll({
    page: query.page,
    limit: query.limit,
    search: query.search,
    isActive: query.isActive,
    parentModuleId: query.parentModuleId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Module fetch successfully"));
});

export const getModuleTree = asyncHandler(
  async (_req: Request, res: Response) => {
    const tree = await moduleService.getTree();
    return res
      .status(200)
      .json(new ApiResponse(200, tree, "Module tree fetched successfully"));
  },
);

export const getModuleById = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ModuleIdParams;
    const moduleDoc = await moduleService.getById(params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, moduleDoc, "Module fetched successfully"));
  },
);

export const updateModule = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ModuleIdParams;
    const body = req.body as UpdateActionBody;
    const moduleDoc = await moduleService.update(params.id, body);
    return res
      .status(200)
      .json(new ApiResponse(200, moduleDoc, "Module updated successfully"));
  },
);

export const updateModuleStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ModuleIdParams;
    const body = req.body as UpdateModuleStatusBody;
    const moduleDoc = await moduleService.updateStatus(
      params.id,
      body.isActive,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, moduleDoc, "Module status updated successfully"),
      );
  },
);

export const deleteModule = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as ModuleIdParams;
    await moduleService.remove(params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Module deleted successfully"));
  },
);
