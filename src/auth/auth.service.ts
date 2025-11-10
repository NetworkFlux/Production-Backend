import logger from "../configs/logger";
import bcrypt from "bcrypt";
import type { User } from "../user/user.model";
import { userService } from "../user/user.service";

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, 100);
    } catch (error: any) {
      logger.error(`[SERVICE] Error hashing password: ${error}`);
      throw new Error("[SERVICE] Error hashing password");
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error: any) {
      logger.error(`[SERVICE] Error comparing password: ${error}`);
      throw new Error("[SERVICE] Error comparing password");
    }
  }

  async authenticateUser(username: string, password: string): Promise<User> {
    try {
      const existingUser: User | undefined =
        userService.getUserByUsername(username);

      if (existingUser === undefined) {
        throw new Error("[SERVICE] User not found");
      }

      const isPasswordValid: boolean = await this.comparePassword(
        password,
        existingUser.password
      );

      if (!isPasswordValid) {
        throw new Error("[SERVICE] Invalid password");
      }

      logger.info(
        `[SERVICE] User ${existingUser.username} authenticated successfully`
      );

      return existingUser;
    } catch (error: any) {
      logger.error(`[SERVICE] Error authenticating user: ${error}`);
      throw error;
    }
  }
}

export const authService = new AuthService();
