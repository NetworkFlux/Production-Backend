/**
 * @file itemController.test.ts
 * @description Unit tests for Express controller functions in itemController.ts.
 * Each controller is tested for:
 *  - ✅ Normal (happy) path
 *  - ❌ Not found (404) path, when applicable
 *  - ⚠️ Error path, ensuring `next(error)` is called
 */

import type { Request, Response, NextFunction } from "express";
import {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../src/controllers/itemController";
import { items } from "../src/models/item";

describe("Item Controller", () => {
  let res: Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Reset our in-memory data store before each test
    items.length = 0;

    // Create reusable mock response & next() objects
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    next = jest.fn();
  });

  // ---------------------------------------------------------------------------
  // 🧩 CREATE ITEM
  // ---------------------------------------------------------------------------

  it("should create a new item successfully", () => {
    const req = { body: { name: "Test Item" } } as Request;

    createItem(req, res, next);

    expect(items.length).toBe(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Test Item" })
    );
  });

  it("should call next(error) if createItem throws", () => {
    const req = { body: { name: "Test" } } as Request;
    const pushSpy = jest.spyOn(items, "push").mockImplementation(() => {
      throw new Error("Push failed");
    });

    createItem(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));

    pushSpy.mockRestore();
  });

  // ---------------------------------------------------------------------------
  // 🧩 GET ITEMS
  // ---------------------------------------------------------------------------

  it("should return all items", () => {
    items.push({ id: 1, name: "Existing Item" });
    const req = {} as Request;

    getItems(req, res, next);

    expect(res.json).toHaveBeenCalledWith(items);
  });

  it("should call next(error) if getItems throws", () => {
    const req = {} as Request;
    const resMock = {
      json: jest.fn(() => {
        throw new Error("JSON fail");
      }),
    } as unknown as Response;

    getItems(req, resMock, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 GET ITEM BY ID
  // ---------------------------------------------------------------------------

  it("should return an item by ID", () => {
    items.push({ id: 1, name: "Item 1" });
    const req = { params: { id: "1" } } as unknown as Request;

    getItemById(req, res, next);

    expect(res.json).toHaveBeenCalledWith(items[0]);
  });

  it("should return 404 if item is not found (getItemById)", () => {
    const req = { params: { id: "999" } } as unknown as Request;

    getItemById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Item not found" });
  });

  it("should call next(error) if getItemById throws", () => {
    const req = { params: { id: "1" } } as unknown as Request;
    const resMock = {
      json: jest.fn(() => {
        throw new Error("Boom");
      }),
    } as unknown as Response;

    getItemById(req, resMock, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 UPDATE ITEM
  // ---------------------------------------------------------------------------

  it("should update an existing item", () => {
    items.push({ id: 1, name: "Old Name" });
    const req = {
      params: { id: "1" },
      body: { name: "New Name" },
    } as unknown as Request;

    updateItem(req, res, next);

    expect(items[0].name).toBe("New Name");
    expect(res.json).toHaveBeenCalledWith(items[0]);
  });

  it("should return 404 if item not found (updateItem)", () => {
    const req = {
      params: { id: "999" },
      body: { name: "Does not exist" },
    } as unknown as Request;

    updateItem(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Item not found" });
  });

  it("should call next(error) if updateItem throws", () => {
    items.push({ id: 1, name: "To Update" });
    const req = {
      params: { id: "1" },
      body: { name: "New Name" },
    } as unknown as Request;
    const resMock = {
      json: jest.fn(() => {
        throw new Error("Oops");
      }),
    } as unknown as Response;

    updateItem(req, resMock, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ---------------------------------------------------------------------------
  // 🧩 DELETE ITEM
  // ---------------------------------------------------------------------------

  it("should delete an existing item", () => {
    items.push({ id: 1, name: "Item to delete" });
    const req = { params: { id: "1" } } as unknown as Request;

    deleteItem(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(items.length).toBe(0);
  });

  it("should return 404 if item not found (deleteItem)", () => {
    const req = { params: { id: "999" } } as unknown as Request;

    deleteItem(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Item not found" });
  });

  it("should call next(error) if deleteItem throws", () => {
    items.push({ id: 1, name: "To Delete" });
    const req = { params: { id: "1" } } as unknown as Request;
    const resMock = {
      json: jest.fn(() => {
        throw new Error("Bad");
      }),
    } as unknown as Response;

    deleteItem(req, resMock, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
