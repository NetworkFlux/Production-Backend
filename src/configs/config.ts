import dotenv from "dotenv";

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  logLevel: string;
  jwtSecret: string;
  arcjetKey: string;
}

const config: Config = {
  port: Number(process.env.PORT),
  nodeEnv: process.env.NODE_ENV || "development",
  logLevel: process.env.LOG_LEVEL || "info",
  jwtSecret: process.env.JWT_SECRET || "secret-key",
  arcjetKey: process.env.ARCJET_KEY || "secret-key",
};

export default config;
