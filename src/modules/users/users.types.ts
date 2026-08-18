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
  roles?: Types.ObjectId[];
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
}
