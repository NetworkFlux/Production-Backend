import type { User } from "../user/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
