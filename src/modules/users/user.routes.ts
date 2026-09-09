import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  assignRolesSchema,
  createUserSchema,
  deleteUserSchema,
  getUserByIdSchema,
  getUsersSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.validation.js";
import {
  assignRoles,
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
  updateUserStatus,
} from "./user.controller.js";

const router = Router();
router.use(authenticate);

router.post("/", validate(createUserSchema), createUser);
router.get("/", validate(getUsersSchema), getUsers);
router.get("/:id", validate(getUserByIdSchema), getUserById);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.patch("/:id/status", validate(updateUserStatusSchema), updateUserStatus);
router.patch("/:id/roles", validate(assignRolesSchema), assignRoles);
router.delete("/:id", validate(deleteUserSchema), deleteUser);

export default router;
