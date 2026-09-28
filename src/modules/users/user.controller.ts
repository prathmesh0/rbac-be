import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { userService } from "./user.service.js";
import {
  AssignRolesBody,
  CreateUserBody,
  GetUsersQuery,
  UpdateUserBody,
  UpdateUserStatusBody,
  UserIdParams,
} from "./user.validation.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.create(req.body as CreateUserBody);

  return res
    .status(201)
    .json(new ApiResponse(201, user, "User created successfully"));
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = (req.validatedQuery ?? req.query) as GetUsersQuery;

  const result = await userService.getAll({
    page: query.page,
    limit: query.limit,
    search: query.search,
    isActive: query.isActive,
    roleId: query.roleId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Users fetched successfully"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const params = (req.validatedParams ?? req.params) as UserIdParams;
  const user = await userService.getById(params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const params = (req.validatedParams ?? req.params) as UserIdParams;
  const body = req.body as UpdateUserBody;

  const user = await userService.update(params.id, body);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User updated successfully"));
});

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Not authenticated");
    }

    const params = (req.validatedParams ?? req.params) as UserIdParams;
    const body = req.body as UpdateUserStatusBody;

    const user = await userService.updateStatus(
      params.id,
      body.isActive,
      req.user.id,
    );

    return res
      .status(200)
      .json(new ApiResponse(200, user, "User status updated successfully"));
  },
);

export const assignRoles = asyncHandler(async (req: Request, res: Response) => {
  const params = (req.validatedParams ?? req.params) as UserIdParams;
  const body = req.body as AssignRolesBody;

  const user = await userService.assignRoles(params.id, body.roleIds);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User roles updated successfully"));
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const params = (req.validatedParams ?? req.params) as UserIdParams;
  await userService.remove(params.id, req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
});
