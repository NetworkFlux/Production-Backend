/**
 * @file loggerController.test.ts
 * @description Unit tests for Express controller functions in loggerController.ts.
 * Each controller is tested for:
 *  - ✅ Normal (happy) path
 *  - ⚠️ Error path, ensuring `next(error)` is called
 */

import type { Request, Response, NextFunction } from "express";
import { log } from "../src/controllers/loggerController";
import logger from "../src/configs/logger"

describe("Logger Controller", () => {
  let res: Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Create reusable mock response & next() objects
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  // 🧩 LOG
  // ---------------------------------------------------------------------------

  it("should log something and send 200", () => {
    const req = {} as Request;
    const infoSpy = jest.spyOn(logger, "info").mockReturnThis();

    log(req, res, next);

    expect(infoSpy).toHaveBeenCalledWith("logger api reached!");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next(error) if logger.info throws", () => {
    const req = {} as Request;

    // Simulate internal logger failure
    jest.spyOn(logger, "info").mockImplementation(() => {
      throw new Error("Logger failed");
    });

    log(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
