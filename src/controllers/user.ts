import { Request, Response } from "express";

export const userController = {
  create(req: Request, res: Response) {
    res.json({ message: "User created" });
  },
  read(req: Request, res: Response) {
    res.json({ message: `User ${req.params.userId} read` });
  },
};
