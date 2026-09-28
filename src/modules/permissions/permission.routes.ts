import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createPermissionSchema,
  deletePermissionSchema,
  getPermissionsByRoleSchema,
  getPermissionsSchema,
  updatePermissionSchema,
} from "./permission.validation.js";
import {
  createPermission,
  deletePermission,
  getPermissions,
  getPermissionsByRole,
  updatePermission,
} from "./permission.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", validate(createPermissionSchema), createPermission);
router.get("/", validate(getPermissionsSchema), getPermissions);
router.get(
  "/role/:roleId",
  validate(getPermissionsByRoleSchema),
  getPermissionsByRole,
);
router.patch("/:id", validate(updatePermissionSchema), updatePermission);
router.delete("/:id", validate(deletePermissionSchema), deletePermission);

export default router;
