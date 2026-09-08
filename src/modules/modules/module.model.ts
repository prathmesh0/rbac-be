import { Schema, model } from "mongoose";
import type { ModuleDocument } from "./module.types.js";

const moduleSchema = new Schema<ModuleDocument>(
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
      unique: true,
      minLength: 2,
      maxLength: 50,
      match: /^[A-Z][A-Z0-9_]*$/,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
    },
    path: {
      type: String,
      trim: true,
      maxLength: 200,
    },
    icon: {
      type: String,
      trim: true,
      maxLength: 100,
    },
    parentModuleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
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
export const Module = model<ModuleDocument>("Module", moduleSchema);
