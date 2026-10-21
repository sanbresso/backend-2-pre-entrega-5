import mongoose from "mongoose";
import Event from "../models/Event.js";

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export async function listEvents() {
  return await Event.find({ status: "published" }).lean();
}

export async function createEvent(eventData = {}, userId) {
  const { title, description, date, capacity } = eventData;

  if (typeof title !== "string" || !title.trim()) {
    throw createHttpError(400, "El título es obligatorio");
  }

  const eventDate = new Date(date);

  if (!date || Number.isNaN(eventDate.getTime())) {
    throw createHttpError(400, "La fecha del evento es inválida");
  }

  if (
    !Number.isInteger(capacity) ||
    capacity < 0
  ) {
    throw createHttpError(400, "La capacidad debe ser un número entero no negativo");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw createHttpError(400, "Identificador de organizador inválido");
  }

  const newEvent = await Event.create({
    title: title.trim(),
    description:
      typeof description === "string"
        ? description.trim()
        : "",
    date: eventDate,
    capacity,
    organizer: userId,
    status: "draft"
  });

  return newEvent;
}

export async function updateEvent(event, updateData = {}) {
  const updates = {};

  if (updateData.title !== undefined) {
    if (
      typeof updateData.title !== "string" ||
      !updateData.title.trim()
    ) {
      throw createHttpError(400, "El título es inválido");
    }

    updates.title = updateData.title.trim();
  }

  if (updateData.description !== undefined) {
    if (typeof updateData.description !== "string") {
      throw createHttpError(400, "La descripción es inválida");
    }

    updates.description = updateData.description.trim();
  }

  if (updateData.date !== undefined) {
    const eventDate = new Date(updateData.date);

    if (
      !updateData.date ||
      Number.isNaN(eventDate.getTime())
    ) {
      throw createHttpError(400, "La fecha es inválida");
    }

    updates.date = eventDate;
  }

  if (updateData.capacity !== undefined) {
    if (
      !Number.isInteger(updateData.capacity) ||
      updateData.capacity < 0
    ) {
      throw createHttpError(400, "La capacidad es inválida");
    }

    updates.capacity = updateData.capacity;
  }

  if (Object.keys(updates).length === 0) {
    throw createHttpError(
      400,
      "No se proporcionaron campos válidos para actualizar"
    );
  }

  event.set(updates);

  return await event.save();
}