import logger from "../configs/logger";
import { User } from "../models/user";
import { hashPassword } from "./auth.service";

let users: User[] = []; // temporary in-memory array

export const getAllUsers = (): User[] => {
  return users;
};

export const getUserById = (id: number): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUserByUsername = (username: string): User | undefined => {
  return users.find(user => user.username === username);
};

export const createUser = async (
  username: string,
  password: string,
  role: string
): Promise<User> => {
  try {
    const existingUser: User | undefined = getUserByUsername(username);

    if (existingUser !== undefined) throw new Error("User already exists");

    const hashedPassword = await hashPassword(password);

    const newUser: User = {
      id: Date.now(),
      username,
      password: hashedPassword,
      role: role === "dev" ? "dev" : "user", // fallback default
      createdAt: new Date(),
    };

    users.push(newUser);

    logger.info(`User ${newUser} created successfully`);

    return newUser;
  } catch (error) {
    logger.error(`Error creating user: ${error}`);
    throw error;
  }
};

export const updateUser = (id: number, username: string): User | undefined => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return undefined;

  users[userIndex].username = username;
  return users[userIndex];
};

export const deleteUser = (id: number): User | undefined => {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return undefined;

  const deleted = users.splice(index, 1)[0];
  return deleted;
};
