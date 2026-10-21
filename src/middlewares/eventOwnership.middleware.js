import mongoose from "mongoose";
import Event from "../models/Event.js";

export const eventOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isObjectIdOrHexString(id)) {
      return res.status(400).json({
        status: "error",
        message: "ID de evento inválido"
      });
    }

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        status: "error",
        message: "Evento no encontrado"
      });
    }

    const isAdmin = req.user.role === "admin";

    const isOwner =
      event.organizer?.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        status: "error",
        message: "No tenés permisos para modificar este evento"
      });
    }

    req.event = event;

    return next();
  } catch (error) {
    return next(error);
  }
};