import { Request, Response } from "express";
import { UserPostItem, UserPutItem } from "../type.js";
import { userModel } from "../models/user.js";

export const userController = {
  async create(req: Request, res: Response) {
    const user: UserPostItem = Object.assign({ uid: res.locals.uid }, req.body);
    await userModel.postItemCommand<UserPostItem>(user);
    res.status(201).json({ message: "User created" });
  },

  async read(req: Request, res: Response) {
    try {
      const user = await userModel.getItemCommand({ uid: res.locals.uid });
      res.status(200).json(user);
    } catch (e) {
      res.status(404).json({ message: "User not found" });
    }
  },

  async update(req: Request, res: Response) {
    await userModel.updateItemCommand({ uid: res.locals.uid }, req.body);
    res.status(200).json({ message: "User updated" });
  },

  async delete(req: Request, res: Response) {
    await userModel.deleteItemCommand({ uid: res.locals.uid });
    res.status(200).json({ message: "User deleted" });
  },
};
