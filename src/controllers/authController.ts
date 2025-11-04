import { NextFunction, Request, Response } from "express";
import { signUpSchema } from "../validations/auth.validation";
import { ZodSafeParseResult } from "zod";
import { formatValidationError } from "../utils/format";
import logger from "../configs/logger";

export const signUp = (
    req: Request,
    res: Response,
    next: NextFunction
): Response | undefined => {
    try {
    const validationResult: ZodSafeParseResult<{
    username: string;
    password: string;
    role: "user" | "dev";
}> = signUpSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const { username, password, role } = validationResult.data;

    // Create User
    // const user = await createUser({ name, email, password, role });

    // const token: string = jwtToken.sign({
    //   id: user.id,
    //   email: user.email,
    //   role: user.role,
    // });

    // cookies.set(res, 'token', token);

    logger.info(`User registered successfully: ${username}`);
    res.status(201).json({
      message: 'User registered',
      user: {
        username: username,
        role: role,
      },
    });
  } catch (error) {
    logger.error('Signup error', error);
    next(error);
  }

}

export const signIn = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

}
export const signOut = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {

}