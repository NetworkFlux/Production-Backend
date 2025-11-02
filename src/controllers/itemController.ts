import type { NextFunction, Request, Response } from "express";
import type { Item } from "../models/item";
import { items } from "../models/item";

export const createItem = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const { name } = req.body;
    const newItem: Item = { id: Date.now(), name };
    items.push(newItem);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
};

export const getItems = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemById = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = items.find(i => i.id === id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    items[itemIndex].name = name;
    res.json(items[itemIndex]);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = parseInt(req.params.id, 10);
    const itemIndex = items.findIndex(i => i.id === id);
    if (itemIndex === -1) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    const deleteItem = items.splice(itemIndex, 1)[0];
    res.json(deleteItem);
  } catch (error) {
    next(error);
  }
};
