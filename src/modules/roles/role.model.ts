import { Schema, model } from "mongoose";
import type { RoleDocument } from "./role.types.js";

const roleSchema = new Schema<RoleDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
      unique: true,
      match: /^[A-Z][A-Z0-9_]*$/,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    isSystemRole: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Role = model<RoleDocument>("Role", roleSchema);
