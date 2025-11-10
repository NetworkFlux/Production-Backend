/**
 * @file auth.service.test.ts
 * @description Unit tests for AuthService
 */

import bcrypt from "bcrypt";
import logger from "../../src/configs/logger";
import { authService } from "../../src/auth/auth.service";
import { userService } from "../../src/user/user.service";
import type { User } from "../../src/user/user.model";

// --- Mocks -------------------------------------------------------------------
jest.mock("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("../../src/configs/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../../src/user/user.service", () => ({
  userService: {
    getUserByUsername: jest.fn(),
  },
}));

// --- Test Suite --------------------------------------------------------------
describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ hashPassword
  it("should hash a password successfully", async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    const result = await authService.hashPassword("mypassword");

    expect(result).toBe("hashedPassword");
    expect(bcrypt.hash).toHaveBeenCalledWith("mypassword", 100);
  });

  it("should throw an error if hashing fails", async () => {
    (bcrypt.hash as jest.Mock).mockRejectedValue(new Error("hash fail"));

    await expect(authService.hashPassword("mypassword")).rejects.toThrow(
      "[SERVICE] Error hashing password"
    );

    expect(logger.error).toHaveBeenCalled();
  });

  // ✅ comparePassword
  it("should compare passwords successfully", async () => {
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await authService.comparePassword("plain", "hashed");
    expect(result).toBe(true);
    expect(bcrypt.compare).toHaveBeenCalledWith("plain", "hashed");
  });

  it("should throw an error if compare fails", async () => {
    (bcrypt.compare as jest.Mock).mockRejectedValue(new Error("compare fail"));

    await expect(authService.comparePassword("a", "b")).rejects.toThrow(
      "[SERVICE] Error comparing password"
    );

    expect(logger.error).toHaveBeenCalled();
  });

  // ✅ authenticateUser
  it("should authenticate user successfully", async () => {
    const fakeUser: User = {
      id: 1,
      username: "alice",
      password: "hashed123",
      role: "user",
      createdAt: new Date(),
    };

    (userService.getUserByUsername as jest.Mock).mockReturnValue(fakeUser);

    // 🧠 Use jest.spyOn() since comparePassword is a real method
    const compareSpy = jest
      .spyOn(authService, "comparePassword")
      .mockResolvedValue(true);

    const result = await authService.authenticateUser("alice", "123");

    expect(result).toBe(fakeUser);
    expect(logger.info).toHaveBeenCalledWith(
      `[SERVICE] User ${fakeUser.username} authenticated successfully`
    );

    compareSpy.mockRestore();
  });

  it("should throw if user not found", async () => {
    (userService.getUserByUsername as jest.Mock).mockReturnValue(undefined);

    await expect(authService.authenticateUser("ghost", "pw")).rejects.toThrow(
      "[SERVICE] User not found"
    );
  });

  it("should throw if password invalid", async () => {
    const fakeUser = { username: "bob", password: "hash" } as User;
    (userService.getUserByUsername as jest.Mock).mockReturnValue(fakeUser);

    jest.spyOn(authService, "comparePassword").mockResolvedValue(false);

    await expect(authService.authenticateUser("bob", "pw")).rejects.toThrow(
      "[SERVICE] Invalid password"
    );
  });
});
