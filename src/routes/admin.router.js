import { Router } from "express";

import { getUsers } from "../controllers/admin.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get(
  "/users",
  authMiddleware,
  authorizeRoles("admin"),
  getUsers
);

export default router;