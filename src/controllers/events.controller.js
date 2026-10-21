import {
  listEvents,
  createEvent as createEventService,
  updateEvent as updateEventService
} from "../services/events.service.js";

export async function getEvents(req, res, next) {
  try {
    const events = await listEvents();

    return res.status(200).json({
      status: "success",
      payload: events
    });
  } catch (error) {
    next(error);
  }
}

export async function createEvent(req, res, next) {
  try {
    const userId = req.user.id;

    const event = await createEventService(
      req.body,
      userId
    );

    return res.status(201).json({
      status: "success",
      payload: {
        id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: event.date,
        capacity: event.capacity,
        status: event.status,
        organizer: event.organizer.toString()
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const updatedEvent = await updateEventService(
      req.event,
      req.body
    );

    return res.status(200).json({
      status: "success",
      payload: {
        id: updatedEvent._id.toString(),
        title: updatedEvent.title,
        description: updatedEvent.description,
        date: updatedEvent.date,
        capacity: updatedEvent.capacity,
        status: updatedEvent.status,
        organizer: updatedEvent.organizer.toString()
      }
    });
  } catch (error) {
    next(error);
  }
}