import { Router } from "express";
import { loginSchema, registerSchema } from "./auth.validation.js";
import {
  getMe,
  login,
  logout,
  refreshAccessToken,
  register,
} from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe);

export default router;
