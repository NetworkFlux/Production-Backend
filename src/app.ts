import express from "express";
import itemRoutes from "./routes/itemRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import loggerRoutes from "./routes/loggerRoutes";
import helmet from "helmet";
import morgan from "morgan";
import logger from "./configs/logger";
import cors from "cors";
import cookieParser from "cookie-parser";

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

app.use("/api/items", itemRoutes);

app.use("/api/logger", loggerRoutes);

app.use(errorHandler);

export default app;
