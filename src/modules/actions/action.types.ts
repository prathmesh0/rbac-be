import type { Types } from "mongoose";

export interface CreateActionInput {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateActionInput {
  name?: string;
  code?: string;
  description?: string;
}

export interface UpdateActionStatusInput {
  isActive: boolean;
}

export interface ActionDocument {
  _id: Types.ObjectId;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
