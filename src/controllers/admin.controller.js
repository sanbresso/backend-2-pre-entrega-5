import { getAllUsers } from "../repositories/users.repository.js";

export async function getUsers(req, res, next) {
  try {
    const users = await getAllUsers();

    return res.status(200).json({
      status: "success",
      payload: users
    });
  } catch (error) {
    return next(error);
  }
}