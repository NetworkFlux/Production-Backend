import { Router } from "express";
import {
  createItem,
  deleteItem,
  getItemById,
  getItems,
  updateItem,
} from "../controllers/itemController";

const itemRoutes = Router();

itemRoutes.get("/", getItems);
itemRoutes.get("/:id", getItemById);
itemRoutes.post("/", createItem);
itemRoutes.put("/:id", updateItem);
itemRoutes.delete("/:id", deleteItem);

export default itemRoutes;
