import { Schema, model } from "mongoose";
import type { PermissionDocument } from "./permission.type.js";

const permissionSchema = new Schema<PermissionDocument>(
  {
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
      index: true,
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: "Module",
      required: true,
      index: true,
    },
    actionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Action",
      },
    ],
  },
  {
    timestamps: true,
  },
);

// One permission document per (role, module) pair - actionIds holds every
// action granted for that combination. This makes it structurally
// impossible to end up with two conflicting documents for the same
// role+module; adding an action to an existing grant is a PATCH, not a
// second POST.

permissionSchema.index({ roleId: 1, moduleId: 1 }, { unique: true });

export const Permission = model<PermissionDocument>(
  "Permission",
  permissionSchema,
);
