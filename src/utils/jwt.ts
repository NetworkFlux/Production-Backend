import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../configs/config";
import logger from "../configs/logger";

const JWT_SECRET = config.jwtSecret;
const JWT_EXPIRES_IN = "1d";

export const jwtToken = {
  sign: (payload: JwtPayload) => {
    try {
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
      logger.error("Failed to authenticate token", error);
      throw new Error("Failed to authenticate token");
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error("Failed to authenticate token", error);
      throw new Error("Failed to authenticate token");
    }
  },
};
