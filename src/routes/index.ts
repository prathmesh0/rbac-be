import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import actionRoutes from "../modules/actions/action.routes.js";
import roleRoutes from "../modules/roles/role.routes.js";
import moduleRoutes from "../modules/modules/module.routes.js";
import userRoutes from "../modules/users/user.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

router.use("/auth", authRoutes);
router.use("/actions", actionRoutes);
router.use("/roles", roleRoutes);
router.use("/modules", moduleRoutes);
router.use("/users", userRoutes);

export default router;
