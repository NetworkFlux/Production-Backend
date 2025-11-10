import type { NextFunction, Request, Response } from "express";
import aj from "../configs/arcjet";
import { slidingWindow } from "@arcjet/node";
import logger from "../configs/logger";

const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const role: string = req.user?.role || "user";

    let limit: number;
    let message: string;

    switch (role) {
      case "dev":
        limit = 20;
        message = "Dev request limit exceeded (20 second). Slow down.";
        break;
      default:
        limit = 10;
        message = "User request limit exceeded (10 second). Slow down.";
        break;
    }

    const client = aj.withRule(
      slidingWindow({ mode: "LIVE", interval: "1m", max: limit })
    );
    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn("Bot request blocked", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
      });

      return res.status(403).json({
        error: "Forbidden",
        message: "Authomated requests are not allowed",
      });
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn("Shield request blocked", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
        method: req.method,
      });

      return res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy",
      });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn("Rate limit exceeded", {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        path: req.path,
      });

      return res
        .status(403)
        .json({ error: "Forbidden", message: "Too many requests" });
    }

    next();
  } catch (error) {
    console.error("Archet middleware error: ", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with security middleware",
    });
  }
};

export default securityMiddleware;
