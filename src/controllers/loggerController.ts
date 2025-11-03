import type { NextFunction, Request, Response } from "express";
import logger from "../configs/logger";

export const log = (req: Request, res: Response, next: NextFunction): void => {
  try {
    logger.info("logger api reached!");
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
