import logger from "../configs/logger";
import bcrypt from "bcrypt";
import { User } from "../models/user";
import { getUserByUsername } from "./user.service";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing the password: ${error}`);
    throw new Error("Error hashing password");
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error(`Error comparing password: ${error}`);
    throw new Error("Error comparing password");
  }
};

export const authenticateUser = async (
  username: string,
  password: string
): Promise<User> => {
  try {
    const existingUser: User | undefined = getUserByUsername(username);

    if (existingUser === undefined) {
      throw new Error("User not found");
    }

    const isPasswordValid: boolean = await comparePassword(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    logger.info(`User ${existingUser.username} authenticated successfully`);

    return existingUser;
  } catch (error) {
    logger.error(`Error authenticating user: ${error}`);
    throw error;
  }
};
