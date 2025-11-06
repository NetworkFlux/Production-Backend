import logger from "../configs/logger";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    logger.error(`Error hashing the password: ${error}`);
    throw new Error("Error hashing password");
  }
};
