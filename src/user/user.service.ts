import logger from "../configs/logger";
import type { User } from "./user.model";
import { authService } from "../auth/auth.service";

export class UserService {
  private users: User[] = [];

  // GETTERS
  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    return this.users.find(user => user.username === username);
  }

  // CUD - Create - Update - Delete
  async createUser(
    username: string,
    password: string,
    role: string
  ): Promise<User> {
    try {
      const existingUser: User | undefined = this.getUserByUsername(username);

      if (existingUser !== undefined) throw new Error("User already exists");

      const hashedPassword = await authService.hashPassword(password);

      const newUser: User = {
        id: Date.now(),
        username,
        password: hashedPassword,
        role: role === "dev" ? "dev" : "user", // default
        createdAt: new Date(),
      };

      this.users.push(newUser);

      logger.info(`[SERVICE] User ${newUser} created successfully`);

      return newUser;
    } catch (error: any) {
      logger.error(`[SERVICE] Error creating user: ${error}`);
      throw error;
    }
  }

  updateUser(id: number, username: string): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    this.users[userIndex].username = username;
    return this.users[userIndex];
  }

  deleteUser(id: number): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return undefined;

    const deletedUser = this.users.splice(userIndex, 1)[0];
    return deletedUser;
  }
}

export const userService = new UserService();
