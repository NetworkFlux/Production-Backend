import { NextFunction, Request, Response } from "express";
import { signUpSchema } from "../validations/auth.validation";
import { ZodSafeParseResult } from "zod";
import { formatValidationError } from "../utils/format";
import logger from "../configs/logger";
import * as userService from "../service/user.service";
import { jwtToken } from "../utils/jwt";
import { cookies } from "../utils/cookies";
import { User } from "../models/user";

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
  } catch (error) {
    logger.error("Signup error", error);
    next(error);
  }
};

export const signIn = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {};

export const signOut = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {};
