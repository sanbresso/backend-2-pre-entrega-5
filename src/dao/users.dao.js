import User from "../models/User.js";

export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export const findByEmailWithPassword = async (email) => {
  return await User.findOne({ email }).select("+password");
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const findAllUsers = async () => {
  return await User.find()
    .select("first_name last_name email role createdAt")
    .lean();
};