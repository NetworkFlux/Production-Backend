import { NextFunction, Request, Response } from "express";
import { signInSchema, signUpSchema } from "./auth.validation";
import { ZodSafeParseResult } from "zod";
import { formatValidationError } from "../utils/format";
import logger from "../configs/logger";
import { userService } from "../user/user.service";
import { authService } from "../auth/auth.service";
import { jwtToken } from "../utils/jwt";
import { cookies } from "../utils/cookies";
import { User } from "../user/user.model";

// Route: "api/auth/sign-up"
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const validationResult: ZodSafeParseResult<{
      username: string;
      password: string;
      role: "user" | "dev";
    }> = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });
    }

    const { username, password, role } = validationResult.data;

    // Create User
    const user: User = await userService.createUser(username, password, role);

    const token: string = jwtToken.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    cookies.set(res, "token", token);

    logger.info(`User registered successfully: ${username}`);
    res.status(201).json({
      message: "User registered",
      user: {
        id: user.id,
        username: username,
        role: role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    logger.error("SignUp error", error);

    if (error.message === "User with this username already exists")
      return res.status(400).json({ error: "Username already exists" });
    next(error);
  }
};

// Route: "api/auth/sign-in"
export const signIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const validationResult: ZodSafeParseResult<{
      username: string;
      password: string;
    }> = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: formatValidationError(validationResult.error),
      });
    }

    const { username, password } = validationResult.data;

    const user = await authService.authenticateUser(username, password);

    const token = jwtToken.sign({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    cookies.set(res, "token", token);

    logger.info(`User signed in successfully: ${username}`);
    res.status(200).json({
      message: "user signed in successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error("Sign in error", error);
    if (
      error.message === "User not found" ||
      error.message === "Invalid password"
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    next(error);
  }
};

// Route: "api/auth/sign-out"
export const signOut = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    cookies.clear(res, "token");

    logger.info("User signed out successfully");
    res.status(200).json({
      message: "User signed out successfully",
    });
  } catch (error) {
    logger.error("Sign out error", error);
    next(error);
  }
};
