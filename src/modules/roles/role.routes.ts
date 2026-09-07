import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createRoleSchema,
  deleteRoleSchema,
  getRoleByIdSchema,
  getRolesSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
} from "./role.validation.js";
import {
  createRole,
  deleteRole,
  getRoleById,
  getRoles,
  updateRole,
  updateRoleStatus,
} from "./role.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", validate(createRoleSchema), createRole);
router.get("/", validate(getRolesSchema), getRoles);
router.get("/:id", validate(getRoleByIdSchema), getRoleById);
router.patch("/:id/status", validate(updateRoleStatusSchema), updateRoleStatus);
router.patch("/:id", validate(updateRoleSchema), updateRole);
router.delete("/:id", validate(deleteRoleSchema), deleteRole);

export default router;
