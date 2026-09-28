import type { Types } from "mongoose";

export interface CreatePermissionInput {
  roleId: string;
  moduleId: string;
  actionIds: string[];
}

export interface PermissionDocument {
  _id: Types.ObjectId;
  roleId: Types.ObjectId;
  moduleId: Types.ObjectId;
  actionIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModulePermissionSummary {
  module: {
    id: string;
    name: string;
    code: string;
    path?: string;
    icon?: string;
  };
  actions: string[];
}

export interface UserPermissionSummary {
  roles: Array<{ id: string; name: string; code: string }>;
  permissions: ModulePermissionSummary[];
}
