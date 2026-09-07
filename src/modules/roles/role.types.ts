import type { Types } from "mongoose";

export interface CreateRoleInput {
  name: string;
  code: string;
  description?: string;
  isSystemRole?: boolean;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

export interface RoleDocument {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
