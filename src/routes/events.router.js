import { Router } from "express";

import {
  getEvents,
  createEvent,
  updateEvent
} from "../controllers/events.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { eventOwnership } from "../middlewares/eventOwnership.middleware.js";

const router = Router();

router.get("/", getEvents);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  createEvent
);

router.patch(
  "/:id",
  authMiddleware,
  authorizeRoles("organizer", "admin"),
  eventOwnership,
  updateEvent
);

export default router;