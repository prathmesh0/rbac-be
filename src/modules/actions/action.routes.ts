import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createActionSchema,
  deleteActionSchema,
  getActionByIdSchema,
  getActionsSchema,
  updateActionSchema,
  updateActionStatusSchema,
} from "./action.validation.js";
import {
  createAction,
  deleteAction,
  getActionById,
  getActions,
  updateActionStatus,
} from "./action.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", validate(createActionSchema), createAction);
router.get("/", validate(getActionsSchema), getActions);
router.get("/:id", validate(getActionByIdSchema), getActionById);
router.patch(
  "/:id/status",
  validate(updateActionStatusSchema),
  updateActionStatus,
);
router.delete("/:id", validate(deleteActionSchema), deleteAction);

export default router;
