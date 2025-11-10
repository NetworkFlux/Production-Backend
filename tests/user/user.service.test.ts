/**
 * @file user.service.test.ts
 * @description Unit tests for the UserService class.
 * Covers:
 *  ✅ Normal (happy) paths
 *  ❌ Not found / duplicate paths
 *  ⚠️ Error paths (ensuring thrown errors are handled)
 */

import { UserService } from "../../src/user/user.service";
import { hashPassword } from "../../src/auth/auth.service";
import logger from "../../src/configs/logger";

// --- Mocks -------------------------------------------------------------------

jest.mock("../../src/auth/auth.service", () => ({
  hashPassword: jest.fn().mockResolvedValue("hashed_pwd"),
}));

jest.mock("../../src/configs/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// --- Test suite --------------------------------------------------------------

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService(); // fresh instance for each test
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // ✅ CREATE USER
  // ---------------------------------------------------------------------------

  it("should create a new user successfully", async () => {
    const user = await service.createUser("alice", "1234", "user");

    expect(user.username).toBe("alice");
    expect(user.role).toBe("user");
    expect(user.password).toBe("hashed_pwd");
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("[SERVICE] User"),
    );

    const all = service.getAllUsers();
    expect(all.length).toBe(1);
  });

  it("should assign role 'dev' when specified", async () => {
    const user = await service.createUser("bob", "1234", "dev");
    expect(user.role).toBe("dev");
  });

  it("should throw an error when username already exists", async () => {
    await service.createUser("charlie", "1234", "user");

    await expect(
      service.createUser("charlie", "abcd", "user"),
    ).rejects.toThrow("User already exists");

    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("Error creating user"),
    );
  });

  it("should throw and log if hashPassword rejects", async () => {
    (hashPassword as jest.Mock).mockRejectedValueOnce(new Error("Hash fail"));

    await expect(
      service.createUser("eve", "pwd", "user"),
    ).rejects.toThrow("Hash fail");

    expect(logger.error).toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // ✅ GETTERS
  // ---------------------------------------------------------------------------

  it("should get a user by ID", async () => {
    const u = await service.createUser("user1", "pwd", "user");
    const found = service.getUserById(u.id);
    expect(found).toEqual(u);
  });

  it("should return undefined if ID not found", () => {
    const found = service.getUserById(999);
    expect(found).toBeUndefined();
  });

  it("should get a user by username", async () => {
    const u = await service.createUser("user2", "pwd", "user");
    const found = service.getUserByUsername("user2");
    expect(found).toEqual(u);
  });

  it("should return undefined if username not found", () => {
    const found = service.getUserByUsername("ghost");
    expect(found).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // ✅ UPDATE USER
  // ---------------------------------------------------------------------------

  it("should update an existing user's username", async () => {
    const u = await service.createUser("oldname", "pwd", "user");
    const updated = service.updateUser(u.id, "newname");

    expect(updated).toBeDefined();
    expect(updated?.username).toBe("newname");
  });

  it("should return undefined if user to update does not exist", () => {
    const result = service.updateUser(999, "nonexistent");
    expect(result).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // ✅ DELETE USER
  // ---------------------------------------------------------------------------

  it("should delete an existing user", async () => {
    const u = await service.createUser("todelete", "pwd", "user");

    const deleted = service.deleteUser(u.id);

    expect(deleted?.username).toBe("todelete");
    expect(service.getAllUsers().length).toBe(0);
  });

  it("should return undefined if user to delete does not exist", () => {
    const result = service.deleteUser(123);
    expect(result).toBeUndefined();
  });
});
