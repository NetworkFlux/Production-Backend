import express, { Request, Response } from "express";
import itemRoutes from "./routes/userRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import loggerRoutes from "./routes/loggerRoutes";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./configs/logger";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import securityMiddleware from "./middlewares/security.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  morgan("combined", {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.use(securityMiddleware);
app.use("/api/users", userRoutes);

app.use("/api/logger", loggerRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/api", (req: Request, res: Response) => {
  res.status(200).json({ message: "3dots API is running!" });
});

app.use(errorHandler);

export default app;
