import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import actionRoutes from "../modules/actions/action.routes.js";

const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

router.use("/auth", authRoutes);
router.use("/actions", actionRoutes);

export default router;
