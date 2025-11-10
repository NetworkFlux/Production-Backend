import type { CookieOptions, Request, Response } from "express";
import config from "../configs/config";

export const cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  }),

  set: (
    res: Response,
    name: string,
    value: string,
    options: CookieOptions = {}
  ) => {
    res.cookie(name, value, {
      ...cookies.getOptions(),
      ...options,
    } as CookieOptions);
  },

  clear: (res: Response, name: string, options: CookieOptions = {}) => {
    res.clearCookie(name, {
      ...cookies.getOptions(),
      ...options,
    } as CookieOptions);
  },

  get: (req: Request, name: string) => {
    return req.cookies[name];
  },
};
