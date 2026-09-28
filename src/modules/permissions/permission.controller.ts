import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { permissionService } from "./permission.service.js";
import {
  CreatePermissionBody,
  GetPermissionsByRoleParams,
  GetPermissionsQuery,
  PermissionIdParams,
  UpdatePermissionBody,
} from "./permission.validation.js";

export const createPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const permission = await permissionService.create(
      req.body as CreatePermissionBody,
    );
    return res
      .status(201)
      .json(new ApiResponse(201, permission, "Permission created succesfully"));
  },
);

export const getPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const query = (req.validatedQuery ?? req.query) as GetPermissionsQuery;

    const result = await permissionService.getAll({
      page: query.page,
      limit: query.limit,
      roleId: query.roleId,
      moduleId: query.moduleId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Permissions fetched successfully"));
  },
);

export const getPermissionsByRole = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ??
      req.params) as GetPermissionsByRoleParams;

    const permissions = await permissionService.getByRoleId(params.roleId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          permissions,
          "Role permissions fetched successfully",
        ),
      );
  },
);

export const updatePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as PermissionIdParams;
    const body = req.body as UpdatePermissionBody;

    const permission = await permissionService.update(
      params.id,
      body.actionIds,
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, permission, "Permission updated successfully"),
      );
  },
);

export const deletePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const params = (req.validatedParams ?? req.params) as PermissionIdParams;
    await permissionService.remove(params.id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Permission deleted successfully"));
  },
);
