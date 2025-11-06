import { Request, Response, NextFunction } from "express";
import * as userService from "../service/user.service";
import logger from "../configs/logger";

export const getUsers = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const users = userService.getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = userService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const createUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { username, password, role } = req.body;
    const newUser = userService.createUser(username, password, role);
    logger.info("New user created: ", newUser);
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

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
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

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
    res.json(deleted);
  } catch (error) {
    next(error);
  }
};
