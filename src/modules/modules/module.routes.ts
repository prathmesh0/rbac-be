import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createModuleSchema,
  deleteModuleSchema,
  getModuleByIdSchema,
  getModulesSchema,
  getModuleTreeSchema,
  updateModuleSchema,
  updateModuleStatusSchema,
} from "./module.validation.js";
import {
  createModule,
  deleteModule,
  getModuleById,
  getModules,
  getModuleTree,
  updateModule,
  updateModuleStatus,
} from "./module.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", validate(createModuleSchema), createModule);
router.get("/", validate(getModulesSchema), getModules);
// Must be registered before "/:id" - otherwise Express matches "tree"
// as the :id param and it fails ObjectId validation.
router.get("/tree", validate(getModuleTreeSchema), getModuleTree);

router.get("/:id", validate(getModuleByIdSchema), getModuleById);
router.patch("/:id", validate(updateModuleSchema), updateModule);
router.patch(
  "/:id/status",
  validate(updateModuleStatusSchema),
  updateModuleStatus,
);
router.delete("/:id", validate(deleteModuleSchema), deleteModule);
export default router;
