import { Request, Response } from "express";
import { UserPostItem } from "../types/user.js";
import { userModel } from "../models/user.js";
import { check } from "express-validator";

export const userController = {
  async create(req: Request, res: Response) {
    const { id, username, email } = req.body;

    // 必須フィールドが存在するか確認
    if (!id || !username || !email) {
      return res.status(400).json({ message: "ID, username, and email are required" });
    }

    // 不要なフィールドが含まれていないか確認
    const allowedFields = ["id", "username", "email"];
    const invalidFields = Object.keys(req.body).filter((key) => !allowedFields.includes(key));

    if (invalidFields.length > 0) {
      return res.status(400).json({ message: `Invalid fields: ${invalidFields.join(", ")}` });
    }

    if (
      !(await check("id").isString().notEmpty().run(req)) ||
      !(await check("name").isString().notEmpty().run(req)) ||
      !(await check("email").isEmail().notEmpty().run(req))
    ) {
      res.status(400).json({ message: "Invalid id" });
    }
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
