import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { roleService } from "./role.service.js";
import {
  CreateRoleBody,
  GetRolesQuery,
  RoleIdParams,
  UpdateRoleBody,
  UpdateRoleStatusBody,
} from "./role.validation.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.create(req.body as CreateRoleBody);

  return res
    .status(201)
    .json(new ApiResponse(201, role, "Role created successfully"));
});

export const getRoles = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.validatedQuery ?? req.query) as GetRolesQuery;
  const roles = await roleService.getAll({
    page: query.page,
    limit: query.limit,
    search: query.search,
    isActive: query.isActive,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, roles, "Roles fetched successfully"));
});

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const params = (req.validatedParams ?? req.params) as RoleIdParams;
  const role = await roleService.getById(params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role fetched successfully"));
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const params = (req.validatedParams ?? req.params) as RoleIdParams;
  const body = req.body as UpdateRoleBody;
  const role = await roleService.update(params.id, body);
  return res
    .status(200)
    .json(new ApiResponse(200, role, "Role updated successfully"));
});

export const updateRoleStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as RoleIdParams;
    const body = req.body as UpdateRoleStatusBody;

    const role = await roleService.updateStatus(params.id, body.isActive);

    return res
      .status(200)
      .json(new ApiResponse(200, role, "Role status updated successfully"));
  },
);

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const params = (req.validatedParams ?? req.params) as RoleIdParams;
  await roleService.remove(params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Role deleted successfully"));
});
