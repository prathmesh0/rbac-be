import type { Types } from "mongoose";

export interface CreateModuleInput {
  name: string;
  code: string;
  description?: string;
  path?: string;
  icon?: string;
  parentModuleId?: string | null;
  order?: number;
}

export interface UpdateModuleInput {
  name?: string;
  description?: string;
  path?: string;
  icon?: string;
  parentModuleId?: string | null;
  order?: number;
}

export interface ModuleDocument {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  path?: string;
  icon?: string;
  parentModuleId?: Types.ObjectId | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModuleTreeNode extends ModuleDocument {
  children: ModuleTreeNode[];
}
