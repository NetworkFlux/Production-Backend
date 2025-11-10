import { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import logger from "../configs/logger";

// Route: "api/users/ GET"
export const getUsers = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userRole: string | undefined = req.user?.role;
    if (userRole !== "dev") {
      res.status(403).json({ message: "Operation denied"});
      return;
    }

    const users = userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Route: "api/users/:id GET"
export const getUserById = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const userRole: string | undefined = req.user?.role;
    if (userRole !== "dev") {
      res.status(403).json({ message: "Operation denied"});
      return;
    }

    const id = parseInt(req.params.id, 10);
    const user = userService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error: any) {
    next(error);
  }
};

// Route: "api/users/ POST"
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password, role } = req.body;
    const newUser = await userService.createUser(username, password, role);
    logger.info("[CONTROLLER] New user created: ", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

// Route: "api/users/:id PUT"
export const updateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const { username } = req.body;
    const updatedUser = userService.updateUser(id, username);
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// Route: "api/users/:id DELETE"
export const deleteUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = userService.deleteUser(id);
    if (!deleted) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    logger.info("User deleted: ", deleted);
    res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};
