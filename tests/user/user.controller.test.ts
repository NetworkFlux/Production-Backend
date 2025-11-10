/**
 * @file user.controller.test.ts
 * @description Unit tests for user controller functions.
 * Tests happy, denied, and error cases for all CRUD controller functions.
 */

import type { Request, Response, NextFunction } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../../src/user/user.controller";
import { userService } from "../../src/user/user.service";
import logger from "../../src/configs/logger";

// --- Mocks -------------------------------------------------------------------

jest.mock("../../src/user/user.service", () => ({
  userService: {
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));

jest.mock("../../src/configs/logger", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// --- Setup -------------------------------------------------------------------

describe("User Controller", () => {
  let res: Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 🧩 GET USERS
  // ---------------------------------------------------------------------------

  it("should return users if role is dev", () => {
    const req = { user: { role: "dev" } } as unknown as Request;
    const fakeUsers = [{ id: 1, username: "Alice" }];
    (userService.getAllUsers as jest.Mock).mockReturnValue(fakeUsers);

    getUsers(req, res, next);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it("should return 403 if role is not dev (getUsers)", () => {
    const req = { user: { role: "user" } } as unknown as Request;

    getUsers(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Operation denied" });
  });

  it("should call next(error) if getUsers throws", () => {
    const req = { user: { role: "dev" } } as unknown as Request;
    (userService.getAllUsers as jest.Mock).mockImplementation(() => {
      throw new Error("DB fail");
    });

    getUsers(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 GET USER BY ID
  // ---------------------------------------------------------------------------

  it("should return a user by ID if role is dev", () => {
    const req = { params: { id: "1" }, user: { role: "dev" } } as unknown as Request;
    const fakeUser = { id: 1, username: "Alice" };
    (userService.getUserById as jest.Mock).mockReturnValue(fakeUser);

    getUserById(req, res, next);

    expect(userService.getUserById).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("should return 404 if user not found", () => {
    const req = { params: { id: "999" }, user: { role: "dev" } } as unknown as Request;
    (userService.getUserById as jest.Mock).mockReturnValue(undefined);

    getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should return 403 if role is not dev (getUserById)", () => {
    const req = { params: { id: "1" }, user: { role: "user" } } as unknown as Request;

    getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Operation denied" });
  });

  it("should call next(error) if getUserById throws", () => {
    const req = { params: { id: "1" }, user: { role: "dev" } } as unknown as Request;
    (userService.getUserById as jest.Mock).mockImplementation(() => {
      throw new Error("Boom");
    });

    getUserById(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 CREATE USER
  // ---------------------------------------------------------------------------

  it("should create a user successfully", async () => {
    const req = {
      body: { username: "bob", password: "1234", role: "user" },
    } as unknown as Request;
    const fakeUser = { id: 1, username: "bob", role: "user" };
    (userService.createUser as jest.Mock).mockResolvedValue(fakeUser);

    await createUser(req, res, next);

    expect(userService.createUser).toHaveBeenCalledWith("bob", "1234", "user");
    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  it("should call next(error) if createUser throws", async () => {
    const req = {
      body: { username: "errorUser", password: "1234", role: "user" },
    } as unknown as Request;
    (userService.createUser as jest.Mock).mockImplementation(() => {
      throw new Error("Create failed");
    });

    await createUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 UPDATE USER
  // ---------------------------------------------------------------------------

  it("should update an existing user", () => {
    const req = {
      params: { id: "1" },
      body: { username: "newname" },
    } as unknown as Request;
    const updated = { id: 1, username: "newname" };
    (userService.updateUser as jest.Mock).mockReturnValue(updated);

    updateUser(req, res, next);

    expect(userService.updateUser).toHaveBeenCalledWith(1, "newname");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  it("should return 404 if user not found (updateUser)", () => {
    const req = {
      params: { id: "999" },
      body: { username: "ghost" },
    } as unknown as Request;
    (userService.updateUser as jest.Mock).mockReturnValue(undefined);

    updateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should call next(error) if updateUser throws", () => {
    const req = {
      params: { id: "1" },
      body: { username: "err" },
    } as unknown as Request;
    (userService.updateUser as jest.Mock).mockImplementation(() => {
      throw new Error("Oops");
    });

    updateUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 DELETE USER
  // ---------------------------------------------------------------------------

  it("should delete an existing user", () => {
    const req = { params: { id: "1" } } as unknown as Request;
    const deleted = { id: 1, username: "deleted" };
    (userService.deleteUser as jest.Mock).mockReturnValue(deleted);

    deleteUser(req, res, next);

    expect(logger.info).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });

  it("should return 404 if user not found (deleteUser)", () => {
    const req = { params: { id: "999" } } as unknown as Request;
    (userService.deleteUser as jest.Mock).mockReturnValue(undefined);

    deleteUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
  });

  it("should call next(error) if deleteUser throws", () => {
    const req = { params: { id: "1" } } as unknown as Request;
    (userService.deleteUser as jest.Mock).mockImplementation(() => {
      throw new Error("Bad");
    });

    deleteUser(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
