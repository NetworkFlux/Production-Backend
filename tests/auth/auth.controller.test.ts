/**
 * @file auth.controller.test.ts
 * @description Unit tests for the auth controller (signUp, signIn, signOut)
 */

import { signUp, signIn, signOut } from "../../src/auth/auth.controller";
import { userService } from "../../src/user/user.service";
import { authService } from "../../src/auth/auth.service";
import { jwtToken } from "../../src/utils/jwt";
import { cookies } from "../../src/utils/cookies";
import { signInSchema, signUpSchema } from "../../src/auth/auth.validation";
import type { Request, Response } from "express";

jest.mock("../../src/user/user.service");
jest.mock("../../src/auth/auth.service");
jest.mock("../../src/utils/jwt");
jest.mock("../../src/utils/cookies");
jest.mock("../../src/configs/logger");
jest.mock("../../src/auth/auth.validation", () => ({
  signUpSchema: { safeParse: jest.fn() },
  signInSchema: { safeParse: jest.fn() },
}));
jest.mock("../../src/utils/format", () => ({
  formatValidationError: jest.fn().mockReturnValue("validation error"),
}));

describe("Auth Controller", () => {
  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  // ---------------------------------------------------------------------------
  // 🧩 signUp
  // ---------------------------------------------------------------------------
  it("should sign up user successfully", async () => {
    const fakeUser = {
      id: 1,
      username: "alice",
      password: "hashed",
      role: "user",
      createdAt: new Date(),
    };

    (signUpSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { username: "alice", password: "pw", role: "user" },
    });
    (userService.createUser as jest.Mock).mockResolvedValue(fakeUser);
    (jwtToken.sign as jest.Mock).mockReturnValue("token123");

    await signUp(
      { body: { username: "alice", password: "pw", role: "user" } } as Request,
      res,
      next
    );

    expect(userService.createUser).toHaveBeenCalled();
    expect(cookies.set).toHaveBeenCalledWith(res, "token", "token123");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "User registered",
        user: expect.objectContaining({ username: "alice" }),
      })
    );
  });

  it("should return 400 if validation fails (signUp)", async () => {
    (signUpSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: "fail",
    });

    await signUp({ body: {} } as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation failed",
      details: "validation error",
    });
  });

  it("should handle 'User already exists' error", async () => {
    (signUpSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { username: "bob", password: "pw", role: "user" },
    });
    (userService.createUser as jest.Mock).mockRejectedValue(
      new Error("User with this username already exists")
    );

    await signUp({ body: {} } as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Username already exists",
    });
  });

  it("should call next(error) if signUp throws unexpectedly", async () => {
    const error = new Error("unexpected failure");
    (signUpSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { username: "bob", password: "pw", role: "user" },
    });
    (userService.createUser as jest.Mock).mockRejectedValue(error);

    await signUp({ body: {} } as Request, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  // ---------------------------------------------------------------------------
  // 🧩 signIn
  // ---------------------------------------------------------------------------
  it("should sign in user successfully", async () => {
    const fakeUser = {
      id: 1,
      username: "john",
      password: "hashed",
      role: "dev",
    };

    (signInSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { username: "john", password: "pw" },
    });
    (authService.authenticateUser as jest.Mock).mockResolvedValue(fakeUser);
    (jwtToken.sign as jest.Mock).mockReturnValue("token456");

    await signIn(
      { body: { username: "john", password: "pw" } } as Request,
      res,
      next
    );

    expect(authService.authenticateUser).toHaveBeenCalledWith("john", "pw");
    expect(cookies.set).toHaveBeenCalledWith(res, "token", "token456");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "user signed in successfully",
        user: expect.objectContaining({ username: "john" }),
      })
    );
  });

  it("should return 401 for invalid credentials", async () => {
    (signInSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { username: "john", password: "pw" },
    });
    (authService.authenticateUser as jest.Mock).mockRejectedValue(
      new Error("Invalid password")
    );

    await signIn({ body: {} } as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid credentials",
    });
  });

  it("should return 400 if validation fails (signIn)", async () => {
    (signInSchema.safeParse as jest.Mock).mockReturnValue({
      success: false,
      error: "fail",
    });

    await signIn({ body: {} } as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Validation failed",
      details: "validation error",
    });
  });

  it("should call next(error) if signIn throws unexpectedly", async () => {
    const error = new Error("unhandled failure");
    (signInSchema.safeParse as jest.Mock).mockReturnValue({
      success: true,
      data: { username: "john", password: "pw" },
    });
    (authService.authenticateUser as jest.Mock).mockRejectedValue(error);

    await signIn({ body: {} } as Request, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  // ---------------------------------------------------------------------------
  // 🧩 signOut
  // ---------------------------------------------------------------------------
  it("should sign out successfully", () => {
    signOut({} as Request, res, next);

    expect(cookies.clear).toHaveBeenCalledWith(res, "token");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "User signed out successfully",
    });
  });

  it("should call next(error) if signOut throws", () => {
    (cookies.clear as jest.Mock).mockImplementation(() => {
      throw new Error("fail");
    });

    signOut({} as Request, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
