import express from "express";
import itemRoutes from "./routes/itemRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import loggerRoutes from "./routes/loggerRoutes";

const app = express();

app.use(express.json());

app.use("/api/items", itemRoutes);

app.use("/api/logger", loggerRoutes);

app.use(errorHandler);

export default app;
