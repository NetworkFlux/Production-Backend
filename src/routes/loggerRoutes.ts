import { Router } from "express";
import { log } from "../controllers/loggerController";

const loggerRoutes = Router();

loggerRoutes.get("/", log);

export default loggerRoutes;
