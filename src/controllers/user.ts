import { Request, Response } from "express";
import { UserPostItem } from "../type.js";
import { userModel } from "../models/user.js";

export const userController = {
  async create(req: Request, res: Response) {
    const user: UserPostItem = req.body;
    const result = await userModel.postItemCommand(user);

    res.status(201).json({ message: "User created" });
  },
  read(req: Request, res: Response) {
    res.json({ message: `User ${req.params.userId} read` });
  },
};
