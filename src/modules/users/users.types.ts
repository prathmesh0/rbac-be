import { Types } from "mongoose";
export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  roles: Types.ObjectId[];
  refreshTokenHash?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUser {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}

export interface FindUsersOptions {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}
