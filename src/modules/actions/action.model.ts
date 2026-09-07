import { Schema, model } from "mongoose";
import type { ActionDocument } from "./action.types.js";

const actionSchema = new Schema<ActionDocument>(
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
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
      match: /^[A-Z][A-Z0-9_]*$/,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxLength: 500,
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

export const Action = model<ActionDocument>("Action", actionSchema);
